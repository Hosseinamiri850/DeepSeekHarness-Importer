/**
 * Local dashboard server: static UI plus a small JSON API.
 * Binds to loopback only — it reads and writes session files on this machine.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { claudeRoots, dshHome } from './core/paths.js';
import { discoverClaudeSessions, parseClaudeCodeFile, parseClaudeExport } from './core/claude.js';
import { buildSessionRows, estimateTokens, validateRows, DEFAULT_MAX_CHARS } from './core/convert.js';
import { describeDsh, registerSession, writeSessionLog } from './core/dsh.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.join(__dirname, 'web');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

/** Sessions parsed from an uploaded Claude export, keyed by id. */
const exportSessions = new Map();

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  });
  res.end(payload);
}

function readBody(req, limit = 200 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sessionSummary(session) {
  return {
    id: session.id,
    source: session.source,
    sourceLabel: session.sourceLabel,
    name: session.name,
    project: session.project,
    projectHint: session.projectHint,
    cwd: session.cwd,
    entrypoint: session.entrypoint,
    sizeBytes: session.sizeBytes,
    mtime: session.mtime,
    stats: session.stats,
    tokens: estimateTokens(session.stats.chars || 0),
    badge: session.badge || '',
  };
}

function listAllSessions(includeSidechains) {
  const local = discoverClaudeSessions({ includeSidechains }).map(sessionSummary);
  const exported = [...exportSessions.values()].map(sessionSummary);
  return [...exported, ...local];
}

function findSession(id) {
  if (exportSessions.has(id)) return exportSessions.get(id);
  const local = discoverClaudeSessions({ includeSidechains: true }).find((session) => session.id === id);
  if (!local) return null;
  return { ...local, turns: parseClaudeCodeFile(local.file).turns };
}

function previewOf(session, { maxTurns = 40, maxCharsPerMessage = 2500 } = {}) {
  const turns = session.turns.slice(0, maxTurns).map((turn) => ({
    user: turn.user.slice(0, maxCharsPerMessage),
    assistant: turn.assistant.join('\n\n').slice(0, maxCharsPerMessage),
  }));
  return { totalTurns: session.turns.length, shown: turns.length, turns };
}

async function handleApi(req, res, url) {
  const home = dshHome();

  if (req.method === 'GET' && url.pathname === '/api/status') {
    const roots = claudeRoots();
    return json(res, 200, {
      ok: true,
      version: '0.1.0',
      node: process.version,
      dsh: {
        home: home.dir,
        sessionsRoot: home.sessions,
        registry: home.registry,
        exists: home.exists,
        hasRegistry: home.hasRegistry,
        webUrl: process.env.DSH_WEB_URL || '',
      },
      claude: {
        projects: roots.projects,
        exists: fs.existsSync(roots.projects),
      },
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/sessions') {
    const includeSidechains = url.searchParams.get('sidechains') === '1';
    const sessions = listAllSessions(includeSidechains);
    return json(res, 200, { ok: true, count: sessions.length, sessions });
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/sessions/')) {
    const id = decodeURIComponent(url.pathname.slice('/api/sessions/'.length));
    const session = findSession(id);
    if (!session) return json(res, 404, { ok: false, error: 'session not found' });
    return json(res, 200, {
      ok: true,
      session: sessionSummary(session),
      preview: previewOf(session),
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/workspaces') {
    return json(res, 200, { ok: true, ...describeDsh(home) });
  }

  if (req.method === 'POST' && url.pathname === '/api/export') {
    const body = JSON.parse(await readBody(req));
    let parsed;
    try {
      parsed = JSON.parse(body.json);
    } catch {
      return json(res, 400, { ok: false, error: 'file is not valid JSON' });
    }
    const sessions = parseClaudeExport(parsed);
    for (const session of sessions) exportSessions.set(session.id, session);
    return json(res, 200, {
      ok: true,
      imported: sessions.length,
      sessions: sessions.map(sessionSummary),
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/import') {
    const body = JSON.parse(await readBody(req));
    const session = findSession(body.sessionId);
    if (!session) return json(res, 404, { ok: false, error: 'session not found' });

    const dsh = describeDsh(home);
    const workspace = dsh.workspaces.find((candidate) => candidate.id === body.workspaceId);
    if (!workspace) return json(res, 400, { ok: false, error: 'workspace not found' });

    const mode = body.mode === 'register' ? 'register' : 'adopt';
    const maxChars = Number.isFinite(Number(body.maxChars)) ? Number(body.maxChars) : DEFAULT_MAX_CHARS;
    const workspacePath = body.cwd || workspace.path;

    let targetId;
    if (mode === 'adopt') {
      targetId = body.targetSessionId || '';
      if (!workspace.sessionIds.includes(targetId)) {
        return json(res, 400, { ok: false, error: 'target session is not registered in this workspace' });
      }
      const existing = workspace.sessions.find((candidate) => candidate.id === targetId);
      if (existing && !existing.blank && !body.force) {
        return json(res, 409, {
          ok: false,
          error: 'target session already contains a conversation',
          requiresForce: true,
        });
      }
    } else {
      targetId = `session-${randomUUID()}`;
    }

    const title = body.title || `Claude import · ${path.basename(workspacePath) || 'session'}`;
    const built = buildSessionRows({
      turns: session.turns,
      cwd: workspacePath,
      maxChars,
      title,
      sessionId: targetId,
    });
    const problems = validateRows(built.rows);
    if (problems.length > 0) return json(res, 500, { ok: false, error: problems.join('; ') });

    const written = writeSessionLog({ home, workspacePath, sessionId: targetId, rows: built.rows });
    if (mode === 'register') registerSession({ home, workspaceId: workspace.id, sessionId: targetId });

    return json(res, 200, {
      ok: true,
      mode,
      sessionId: targetId,
      file: written.file,
      backup: written.backup,
      restartRequired: mode === 'register',
      workspace: { id: workspace.id, title: workspace.title, path: workspacePath },
      stats: {
        turns: built.turnCount,
        chars: built.chars,
        droppedTurns: built.fitted.dropped,
        tokens: estimateTokens(built.chars),
      },
    });
  }

  return json(res, 404, { ok: false, error: 'unknown endpoint' });
}

function serveStatic(req, res, url) {
  const relative = url.pathname === '/' ? '/index.html' : url.pathname;
  const file = path.join(WEB, path.normalize(relative).replace(/^([/\\])+/, ''));
  if (!file.startsWith(WEB) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    'content-type': MIME[ext] || 'application/octet-stream',
    'cache-control': 'no-cache',
  });
  fs.createReadStream(file).pipe(res);
}

export function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    try {
      if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
      return serveStatic(req, res, url);
    } catch (error) {
      return json(res, 500, { ok: false, error: error?.message || 'internal error' });
    }
  });
}

export function startServer({ port = 0, host = '127.0.0.1' } = {}) {
  const server = createServer();
  return new Promise((resolve) => {
    server.listen(port, host, () => {
      const address = server.address();
      resolve({ server, port: address.port, url: `http://${host}:${address.port}` });
    });
  });
}
