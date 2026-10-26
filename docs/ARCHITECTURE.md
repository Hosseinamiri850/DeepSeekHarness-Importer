# Architecture

## Purpose

Move a Claude conversation into DeepSeek Harness so that DSH can **resume** it.
That requires producing a log DSH's reader accepts *and* making the workspace
registry point at it.

## Data flow

```
Claude sources                     importer                          DSH
─────────────                      ────────                          ───
~/.claude/projects/**/*.jsonl ─┐
conversations.json (export)   ─┴─► parse → turns → rows → zstd ─► sessions/--<cwd>--/session-<id>/session.v4.jsonl.zstd
                                                                              │
                                                   workspace.json ◄───────────┘ (register mode only)
```

1. **Discover** — `core/claude.js` walks the projects root, parses each JSONL, and
   keeps a per-file cache keyed by `mtime` + size.
2. **Normalise** — messages become `{ role, text }`, grouped into turns. Transport
   noise is removed: `API Error: 4xx/5xx`, `No response requested.`,
   `<system-reminder>`, local-command output, interrupted-request notices. Sidechain
   and meta records are skipped.
3. **Budget** — `fitTurns` keeps the newest turns under `maxChars` (default 200k).
4. **Emit** — `buildSessionRows` writes DSH format v4 rows.
5. **Validate** — `validateRows` mirrors the reader's invariants (see below).
6. **Install** — `core/dsh.js` writes the log, backing up anything it replaces, and
   optionally appends the id to `workspace.json`.

## DSH session log format (v4)

A file is a **concatenation of independent Zstandard frames**; each frame holds
one or more newline-delimited JSON rows. The first row is the header:

```json
{"type":"session","version":4,"id":"session-<uuid>","createdAt":<ms>,
 "cwd":"C:\\path","isSeeded":false,"delegationDepth":0,"agentPreset":"standard"}
```

Every following row carries a monotonically increasing `seq` and a `time`:

| Row | Payload that matters |
|---|---|
| `permission/preset`, `sandbox/mode`, `approval/policy` | session-level defaults |
| `session/title` | `{ title, messageSeqs: [seq], source }` — must reference a real message |
| `turn/start`, `step/start` | `{ turn, step }` |
| `user/message` | `{ content:[{type:'text',text}], source, role:'user', id }` + `surfaceOp` |
| `assistant/message` | `{ turn, step, message:{role,content,source,id}, stream: [] }` + `surfaceOp` |
| `tool/call`, `tool/result` | not emitted |
| `step/end`, `turn/end` | `{ turn, step }` / `{ turn, reason }` |

Two constraints are easy to miss and both are hard failures for the reader:

- `assistant/message.data.stream` must be an **array** (empty is fine).
- `session/title.data.messageSeqs` must be an **array of existing message seqs**.

## Why two install modes

DSH lists sessions from `~/.dsh/storages/workspace.json`:

```json
{ "tables": { "workspaces": { "<ws-id>": { "path": "...", "sessionIds": ["session-…"] } } } }
```

The sessions directory is never scanned, so a log written with a fresh id is
invisible until the id is registered — and the registry is read at DSH startup.

| Mode | What it touches | Visible |
|---|---|---|
| `adopt` | only the log of an existing empty session id | after a DSH refresh |
| `register` | a new log + `workspace.json` | after a DSH restart |

`adopt` is the default because it cannot desynchronise a running host. A slot that
already holds a conversation is protected: the API answers `409` unless the caller
passes `force: true`, and the previous log is copied to
`DSH_HOME/backups/claude-import/` first.

## HTTP API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/status` | Node version, Claude root, DSH home/registry detection |
| GET | `/api/sessions?sidechains=1` | List discoverable sessions with stats |
| GET | `/api/sessions/:id` | Summary + transcript preview (first 40 turns) |
| GET | `/api/workspaces` | Workspaces, their sessions, blank-slot info, orphan logs |
| POST | `/api/export` | Parse an uploaded `conversations.json` into in-memory sessions |
| POST | `/api/import` | Build, validate, write, and optionally register a session |

The server binds to loopback, serves `src/web` statically, and makes no outbound
requests.

## Trust boundaries

- Everything read comes from the local machine; nothing is sent anywhere.
- Uploaded exports are parsed in memory only; they are never written to disk.
- Path construction for the sessions directory is derived from the registered
  workspace path, and the target session id must already be registered in that
  workspace, which prevents path traversal through request fields.
