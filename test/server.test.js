import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startServer } from '../src/server.js';
import { encodeRows, readRows } from '../src/core/zstd.js';
import { projectDirName } from '../src/core/paths.js';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cdi-test-'));
  const dshHome = path.join(root, 'dsh');
  const workspacePath = path.join(root, 'my-project');
  const claudeProjects = path.join(root, 'claude-projects');
  const blankId = 'session-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

  fs.mkdirSync(path.join(dshHome, 'storages'), { recursive: true });
  fs.mkdirSync(workspacePath, { recursive: true });

  const registry = {
    unit: { name: 'workspace', version: 2 },
    global: {
      initialized: true,
      workspaceIds: ['ws-1'],
      archivedSessionIds: [],
      pinnedSessionIds: [],
      defaultWorkspaceId: 'ws-1',
    },
    tables: {
      workspaces: {
        'ws-1': {
          path: workspacePath,
          title: 'my-project',
          sessionIds: [blankId],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };
  fs.writeFileSync(path.join(dshHome, 'storages', 'workspace.json'), JSON.stringify(registry, null, 2));

  const blankDir = path.join(dshHome, 'sessions', projectDirName(workspacePath), blankId);
  fs.mkdirSync(blankDir, { recursive: true });
  fs.writeFileSync(
    path.join(blankDir, 'session.v4.jsonl.zstd'),
    encodeRows([
      {
        type: 'session', version: 4, id: blankId, createdAt: Date.now(),
        cwd: workspacePath, isSeeded: false, delegationDepth: 0, agentPreset: 'standard',
      },
    ]),
  );

  const projectDir = path.join(claudeProjects, 'C--my-project');
  fs.mkdirSync(projectDir, { recursive: true });
  const lines = [
    { type: 'user', message: { role: 'user', content: 'hello there' }, cwd: workspacePath, sessionId: 'fixture-1', timestamp: '2026-01-01T10:00:00Z' },
    { type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: 'hi! how can I help?' }] }, timestamp: '2026-01-01T10:00:05Z' },
    { type: 'user', message: { role: 'user', content: 'build the thing' }, timestamp: '2026-01-01T10:01:00Z' },
    { type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: 'API Error: 500 upstream' }] }, timestamp: '2026-01-01T10:01:05Z' },
    { type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: 'Done — tests are green.' }] }, timestamp: '2026-01-01T10:02:00Z' },
    { type: 'user', isSidechain: true, message: { role: 'user', content: 'sidechain noise' }, timestamp: '2026-01-01T10:03:00Z' },
  ];
  fs.writeFileSync(path.join(projectDir, 'fixture-1.jsonl'), lines.map((line) => JSON.stringify(line)).join('\n'));

  return { root, dshHome, workspacePath, claudeProjects, blankId };
}

test('dashboard API: discover, preview, adopt, register', async (t) => {
  const env = fixture();
  process.env.DSH_HOME = env.dshHome;
  process.env.CLAUDE_PROJECTS_DIR = env.claudeProjects;
  const { server, url } = await startServer({ port: 0 });
  t.after(() => {
    server.close();
    fs.rmSync(env.root, { recursive: true, force: true });
    delete process.env.DSH_HOME;
    delete process.env.CLAUDE_PROJECTS_DIR;
  });

  const status = await (await fetch(`${url}/api/status`)).json();
  assert.equal(status.dsh.hasRegistry, true);
  assert.equal(status.claude.exists, true);

  const list = await (await fetch(`${url}/api/sessions`)).json();
  assert.equal(list.count, 1);
  assert.equal(list.sessions[0].id, 'fixture-1');
  assert.equal(list.sessions[0].stats.turns, 2, 'the API-error reply must not become a turn');

  const detail = await (await fetch(`${url}/api/sessions/fixture-1`)).json();
  assert.equal(detail.preview.totalTurns, 2);
  assert.match(detail.preview.turns[1].assistant, /tests are green/);

  const workspaces = await (await fetch(`${url}/api/workspaces`)).json();
  assert.equal(workspaces.workspaces.length, 1);
  assert.equal(workspaces.workspaces[0].sessions[0].blank, true);

  const adopt = await (await fetch(`${url}/api/import`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'fixture-1',
      workspaceId: 'ws-1',
      mode: 'adopt',
      targetSessionId: env.blankId,
      maxChars: 200000,
    }),
  })).json();
  assert.equal(adopt.ok, true);
  assert.equal(adopt.sessionId, env.blankId);
  assert.equal(adopt.stats.turns, 2);
  assert.equal(adopt.restartRequired, false);

  const written = readRows(adopt.file);
  assert.equal(written[0].id, env.blankId);
  assert.equal(written.filter((row) => row.type === 'assistant/message').length, 2);

  const register = await (await fetch(`${url}/api/import`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: 'fixture-1', workspaceId: 'ws-1', mode: 'register', maxChars: 0 }),
  })).json();
  assert.equal(register.ok, true);
  assert.equal(register.restartRequired, true);
  const registry = JSON.parse(fs.readFileSync(path.join(env.dshHome, 'storages', 'workspace.json'), 'utf8'));
  assert.ok(registry.tables.workspaces['ws-1'].sessionIds.includes(register.sessionId));

  const overwrite = await fetch(`${url}/api/import`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'fixture-1',
      workspaceId: 'ws-1',
      mode: 'adopt',
      targetSessionId: env.blankId,
      maxChars: 1000,
    }),
  });
  assert.equal(overwrite.status, 409, 'a non-empty slot is protected unless forced');
});
