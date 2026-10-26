/**
 * DeepSeek Harness side: workspace registry, existing sessions, and installation.
 *
 * DSH does not scan the sessions directory — a session is listed only when its
 * id appears in `storages/workspace.json` under a workspace's `sessionIds`.
 * That is why the importer works in two modes:
 *   - `adopt`: write into an existing (usually blank) registered session id.
 *   - `register`: write a fresh id and append it to the registry (needs a DSH
 *     restart before the session shows up in the sidebar).
 */
import fs from 'node:fs';
import path from 'node:path';
import { dshHome, projectDirName, readJson } from './paths.js';
import { encodeRows, readRows } from './zstd.js';

export function readRegistry(home) {
  const info = typeof home === 'string' ? dshHome(home) : home;
  const raw = readJson(info.registry, null);
  if (!raw) return { raw: null, workspaces: [] };
  const workspaces = [];
  const table = raw?.tables?.workspaces || {};
  const ids = raw?.global?.workspaceIds || Object.keys(table);
  for (const id of ids) {
    const record = table[id];
    if (!record) continue;
    workspaces.push({
      id,
      title: record.title || path.basename(record.path || ''),
      path: record.path || '',
      sessionIds: (record.sessionIds || []).map(String),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
  return { raw, workspaces, archivedSessionIds: (raw?.global?.archivedSessionIds || []).map(String) };
}

function sessionDir(home, workspacePath, sessionId) {
  return path.join(home.sessions, projectDirName(workspacePath), sessionId);
}

function describeLog(dir) {
  const file = path.join(dir, 'session.v4.jsonl.zstd');
  if (!fs.existsSync(file)) return { exists: false, file };
  const stat = fs.statSync(file);
  let rows = 0;
  let title = '';
  let turns = 0;
  try {
    const parsed = readRows(file);
    rows = parsed.length;
    turns = parsed.filter((row) => row.type === 'turn/start').length;
    title = parsed.find((row) => row.type === 'session/title')?.data?.title || '';
  } catch {
    rows = -1;
  }
  return {
    exists: true,
    file,
    sizeBytes: stat.size,
    mtime: stat.mtime.toISOString(),
    rows,
    turns,
    title,
    blank: rows === 1,
    corrupt: rows === -1,
  };
}

/** Full picture of a DSH installation: workspaces, their sessions, unregistered logs. */
export function describeDsh(homeInput) {
  const home = typeof homeInput === 'string' ? dshHome(homeInput) : homeInput;
  const registry = readRegistry(home);
  const workspaces = registry.workspaces.map((workspace) => ({
    ...workspace,
    sessions: workspace.sessionIds.map((sessionId) => ({
      id: sessionId,
      ...describeLog(sessionDir(home, workspace.path, sessionId)),
    })),
  }));

  const registered = new Set(workspaces.flatMap((workspace) => workspace.sessionIds));
  const orphans = [];
  if (fs.existsSync(home.sessions)) {
    for (const project of fs.readdirSync(home.sessions, { withFileTypes: true })) {
      if (!project.isDirectory()) continue;
      for (const session of fs.readdirSync(path.join(home.sessions, project.name), { withFileTypes: true })) {
        if (!session.isDirectory() || registered.has(session.name)) continue;
        const dir = path.join(home.sessions, project.name, session.name);
        const log = describeLog(dir);
        if (log.exists) orphans.push({ id: session.name, projectDir: project.name, ...log });
      }
    }
  }

  return {
    home: home.dir,
    sessionsRoot: home.sessions,
    registryPath: home.registry,
    exists: home.exists,
    hasRegistry: home.hasRegistry,
    workspaces,
    orphans,
  };
}

/** Pick registered ids that hold nothing but a header — safe adopt targets. */
export function blankTargets(workspace) {
  return workspace.sessions.filter((session) => session.blank || !session.exists).map((session) => session.id);
}

function backupFile(file, home) {
  if (!fs.existsSync(file)) return null;
  const dir = path.join(home.dir, 'backups', 'claude-import');
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, `${path.basename(path.dirname(file))}-${Date.now()}.jsonl.zstd`);
  fs.copyFileSync(file, target);
  return target;
}

/**
 * Write a session log into the DSH sessions root.
 * @returns {{file: string, backup: string|null, dir: string}}
 */
export function writeSessionLog({ home: homeInput, workspacePath, sessionId, rows }) {
  const home = typeof homeInput === 'string' ? dshHome(homeInput) : homeInput;
  const dir = sessionDir(home, workspacePath, sessionId);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'session.v4.jsonl.zstd');
  const backup = backupFile(file, home);
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, encodeRows(rows));
  fs.renameSync(tmp, file);
  return { file, backup, dir };
}

/** Append a session id to a workspace's registry entry (restart required). */
export function registerSession({ home: homeInput, workspaceId, sessionId }) {
  const home = typeof homeInput === 'string' ? dshHome(homeInput) : homeInput;
  const raw = readJson(home.registry, null);
  if (!raw?.tables?.workspaces?.[workspaceId]) throw new Error('workspace not found in registry');
  const registryBackup = `${home.registry}.backup-${Date.now()}`;
  fs.copyFileSync(home.registry, registryBackup);
  const record = raw.tables.workspaces[workspaceId];
  record.sessionIds = [...new Set([...(record.sessionIds || []).map(String), sessionId])];
  record.updatedAt = new Date().toISOString();
  fs.writeFileSync(home.registry, `${JSON.stringify(raw, null, 2)}\n`);
  return { registry: home.registry, backup: registryBackup };
}
