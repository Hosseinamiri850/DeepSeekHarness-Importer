# Claude → DeepSeek Harness Importer

**Move your Claude conversations into [DeepSeek Harness](https://github.com/deepseek-ai) as native, resumable sessions — from a local dashboard, without uploading anything.**

![Dashboard](assets/dashboard-dark.png)

[فارسی](README.fa.md) · [User guide](docs/USER-GUIDE.md) · [راهنمای فارسی](docs/USER-GUIDE.fa.md)

---

DeepSeek Harness (DSH) keeps its sessions in an append-only JSONL log compressed
with Zstandard, and it only lists a session when the workspace registry names it.
There is no import button. This tool closes that gap: it reads your Claude
transcripts, converts the conversation into DSH's **format v4** session log, and
installs it into a workspace you pick — so the session opens in DSH with its
history, and you can keep working from where Claude stopped.

## Why it exists

Moving a chat between AI tools is usually copy/paste, which loses the shape of
the conversation and floods the context window. This importer keeps the turn
structure, respects DSH's validation rules, and — crucially — deals with the two
things that make a hand-made session invisible:

1. **DSH does not scan the sessions folder.** A log on disk shows up only when its
   id appears in `~/.dsh/storages/workspace.json` under a workspace.
2. **Sessions are validated.** Events must carry an id, sequence numbers, surface
   operations and an assistant `stream` array, or the reader refuses the file.

## Features

- **See every session you have.** Auto-discovers Claude Code / Claude Desktop
  local-agent transcripts under `~/.claude/projects`, plus any `conversations.json`
  from *Claude → Settings → Privacy → Export data*.
- **Preview before you commit.** Full transcript view and stats (turns,
  characters, estimated tokens, tool calls, project, size).
- **Fit the budget.** Keep the newest N characters of history (50k → everything);
  the rest is dropped with an explicit count, because resuming replays history
  into every request.
- **Two install modes**, matching how DSH actually works:
  - **Existing slot** — reuses an empty session row of the workspace and appears
    immediately; no restart.
  - **New session** — allocates a fresh id and registers it; needs one DSH restart.
- **Backups, always.** Overwriting a slot saves the previous log under
  `~/.dsh/backups/claude-import/`; registry edits are backed up too.
- **Local only.** The server binds to `127.0.0.1`, never calls the network, and
  reads files on this machine only.
- **Bilingual UI** (English / فارسی, with RTL layout) and dark / light themes.

## Quick start

```bash
# Node.js 22.15+ is required (built-in Zstandard)
node --version

npx claude-to-dsh-importer        # or: node src/cli.js
```

The dashboard opens on a free loopback port. Then:

1. Pick a session on the left.
2. Choose a DSH workspace (existing workspaces are read from your registry).
3. Pick **Existing slot** and press **Import session**.
4. Open DSH, refresh, and the session is under that workspace.

From a clone:

```bash
git clone https://github.com/Hosseinamiri850/Claude-to-DeepSeekHarness-Importer.git
cd Claude-to-DeepSeekHarness-Importer
node src/cli.js --port 4173 --no-open
```

### CLI

```
claude-to-dsh [options]

  -p, --port <port>   listen on a fixed port (default: a free port)
      --host <host>   loopback address to bind (default: 127.0.0.1)
      --no-open       do not open the dashboard automatically
  -v, --version       print the version
  -h, --help          show this help
```

Environment variables: `DSH_HOME` (defaults to `~/.dsh`), `CLAUDE_PROJECTS_DIR`
(defaults to `~/.claude/projects`), `DSH_WEB_URL` (used by the "Open DSH" button).

## Screenshots

| Light theme | فارسی (RTL) |
|---|---|
| ![Light](assets/dashboard-light.png) | ![Persian](assets/dashboard-fa.png) |

<p align="center"><img src="assets/dashboard-mobile.png" width="360" alt="Mobile layout" /></p>

## How it works

```
~/.claude/projects/**/*.jsonl ──► transcript parser ──► DSH v4 rows ──► zstd frames
conversations.json (export)   ──┘                          │
                                                           ▼
                              ~/.dsh/sessions/--<project>--/session-<uuid>/session.v4.jsonl.zstd
                                                           │
                              ~/.dsh/storages/workspace.json (only in "new session" mode)
```

The emitted log contains a version-4 header, the session-level defaults
(`permission/preset`, `sandbox/mode`, `approval/policy`), a title, and one
`turn/start → step/start → user/message → assistant/message → step/end → turn/end`
block per conversation turn. Assistant messages are plain text: no tool events are
fabricated, so the history always satisfies DSH's reader.

Before writing, the rows pass a structural validation (`validateRows`) mirroring
the reader's rules — header id/version/cwd, contiguous `seq`, assistant `stream`
array, turn ordering. Failures are reported instead of installing a broken session.

## What is preserved — and what is not

| Preserved | Not preserved |
|---|---|
| Human and assistant text, in order | Claude tool calls and their results |
| Original project path (DSH shows it under that workspace) | Images, attachments, artifacts |
| Session title, permission/sandbox/approval defaults | Claude's model provenance and signatures |
| Turn boundaries and last-active time | Checkpoints and sidechains (unless enabled) |

Transport noise (`API Error: 4xx/5xx`, `No response requested.`, system reminders,
local-command output) is stripped so it does not become a fake assistant turn.

## Compatibility

- **Node.js 22.15+** — the importer uses the built-in Zstandard API
  (`zlib.zstdCompressSync`). No native dependencies, no build step.
- **DSH session format v4**, the format written by current DeepSeek Harness builds.
  Older DSH releases migrate v0–v3 logs on read, but this tool targets v4.
- **Windows, macOS, Linux** — paths are resolved from `os.homedir()` and can be
  overridden with environment variables.

## Safety

- Reads only `~/.claude/**` and writes only inside `DSH_HOME`.
- Every destructive write keeps a backup first.
- A slot that already holds a conversation is refused unless you explicitly
  confirm the overwrite (the UI asks; the API returns `409`).
- The HTTP server refuses to bind anything but loopback in the default CLI path.

## Development

```bash
node --test "test/**/*.test.js"    # 7 tests: conversion, zstd round-trip, HTTP API
node src/cli.js --port 4599 --no-open
```

Layout:

```
src/
  cli.js              entry point, argument parsing, browser launch
  server.js           HTTP API + static file server
  core/claude.js      discovery and transcript parsing (Claude Code + export)
  core/convert.js     turns → DSH v4 rows, budget, validation
  core/dsh.js         workspace registry, install, backups
  core/zstd.js        zstd frame scanner / encoder
  core/paths.js       home detection and project directory naming
  web/                dashboard (vanilla JS, no build)
```

## Limitations

- Claude Desktop's *regular chat history* lives in Chromium IndexedDB, not in
  `~/.claude`. Export it from **Settings → Privacy → Export data** and upload the
  `conversations.json` in the dashboard.
- Importing a very long history costs tokens on the first resumed request; use the
  budget selector.
- Tool calls are not replayed, so an imported session cannot continue a half-done
  tool action — Claude's tool state is simply not representable in a new log.

## License

MIT © [Hossein Amiri](https://github.com/Hosseinamiri850)
