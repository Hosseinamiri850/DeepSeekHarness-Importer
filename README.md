# DeepSeekHarness-Importer

**Bring conversations from other AI tools into [DeepSeek Harness](https://github.com/deepseek-ai) as native, resumable sessions — from a local dashboard, without uploading anything.**

Today it imports **Claude**. The source picker and the conversion pipeline are built for more: ChatGPT, Gemini, Copilot, Cursor and Codex are already listed in the UI as coming soon.

![Dashboard](assets/dashboard-light.png)

[فارسی](README.fa.md) · [User guide](docs/USER-GUIDE.md) · [راهنمای فارسی](docs/USER-GUIDE.fa.md) · [Architecture](docs/ARCHITECTURE.md)

---

DeepSeek Harness (DSH) keeps its sessions in an append-only JSONL log compressed
with Zstandard, and it only lists a session when the workspace registry names it.
There is no import button. This tool closes that gap: it reads a transcript,
converts the conversation into DSH's **format v4** session log, and installs it
into a workspace you pick — so the session opens in DSH with its history and you
keep working from where the other tool stopped.

## Sources

| Source | Status | How it is read |
|---|---|---|
| **Claude** | ✅ available | Claude Code / Claude Desktop local transcripts under `~/.claude/projects`, plus account exports (`conversations.json`) |
| ChatGPT | 🕓 planned | data export |
| Gemini | 🕓 planned | Takeout / activity export |
| GitHub Copilot | 🕓 planned | CLI transcripts |
| Cursor | 🕓 planned | chat / composer sessions |
| Codex CLI | 🕓 planned | rollout transcripts |

The dashboard always shows the full list so you can see the direction; only
available sources can be selected. Adding one is a registry entry plus a
discovery/parse pair — the converter, installer, and UI stay untouched
(see [CONTRIBUTING](CONTRIBUTING.md#adding-a-source)).

## Why it exists

Moving a chat between AI tools is usually copy/paste, which loses the shape of the
conversation and floods the context window. This importer keeps the turn
structure, respects DSH's validation rules, and — crucially — deals with the two
things that make a hand-made session invisible:

1. **DSH does not scan the sessions folder.** A log on disk shows up only when its
   id appears in `~/.dsh/storages/workspace.json` under a workspace.
2. **Sessions are validated.** Events must carry an id, sequence numbers, surface
   operations and an assistant `stream` array, or the reader refuses the file.

## Features

- **See every session you have.** Auto-discovers Claude Code / Claude Desktop
  local-agent transcripts, and imports `conversations.json` from
  *Claude → Settings → Privacy → Export data*.
- **Preview before you commit.** Chat-style transcript plus stats: turns,
  characters, estimated tokens, tool calls, size, project, last activity.
- **Fit the budget.** Keep the newest N characters (50k → everything); dropped
  turns are reported, because a resumed session replays history every request.
- **Two install modes** matching how DSH actually works:
  - **Existing slot** — reuses an empty session row of the workspace; visible
    immediately, no restart.
  - **New session** — allocates and registers a fresh id; needs one DSH restart.
- **Backups, always.** Overwriting a slot saves the previous log under
  `~/.dsh/backups/claude-import/`; registry edits are backed up too.
- **Local only.** Binds to `127.0.0.1`, makes no outbound requests, reads files on
  this machine only.
- **Bilingual UI** (English / فارسی, RTL-aware) with light and dark themes, built
  on a shadcn-style token system in plain CSS — no build step, no dependencies.

## Quick start

```bash
# Node.js 22.15+ is required (built-in Zstandard)
node --version

npx deepseekharness-importer        # or: node src/cli.js
```

From a clone:

```bash
git clone https://github.com/Hosseinamiri850/DeepSeekHarness-Importer.git
cd DeepSeekHarness-Importer
node src/cli.js --port 4173 --no-open
```

Then:

1. Pick a session on the left.
2. Choose a DSH workspace (read from your registry).
3. Keep **Existing slot** and press **Import session**.
4. Refresh DSH — the session is under that workspace.

### CLI

```
deepseekharness-importer [options]

  -p, --port <port>   listen on a fixed port (default: a free port)
      --host <host>   loopback address to bind (default: 127.0.0.1)
      --no-open       do not open the dashboard automatically
  -v, --version       print the version
  -h, --help          show this help
```

Environment variables: `DSH_HOME` (defaults to `~/.dsh`), `CLAUDE_PROJECTS_DIR`
(defaults to `~/.claude/projects`), `DSH_WEB_URL` (used by the "Open DeepSeek
Harness" button).

## Screenshots

| Light | Dark |
|---|---|
| ![Light](assets/dashboard-light.png) | ![Dark](assets/dashboard-dark.png) |

| فارسی (RTL) | Mobile |
|---|---|
| ![Persian](assets/dashboard-fa.png) | ![Mobile](assets/dashboard-mobile.png) |

## How it works

```
~/.claude/projects/**/*.jsonl ──┐
conversations.json (export)   ──┴─► transcript parser ──► DSH v4 rows ──► zstd frames
                                                                             │
                        ~/.dsh/sessions/--<project>--/session-<uuid>/session.v4.jsonl.zstd
                                                                             │
                        ~/.dsh/storages/workspace.json  (only in "new session" mode)
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
| Human and assistant text, in order | Tool calls and their results |
| Original project path (DSH groups by workspace) | Images, attachments, artifacts |
| Session title, permission/sandbox/approval defaults | Model provenance and signatures |
| Turn boundaries and last-active time | Checkpoints and sidechains (unless enabled) |

Transport noise (`API Error: 4xx/5xx`, `No response requested.`, system reminders,
local-command output) is stripped so it does not become a fake assistant turn.

## Compatibility

- **Node.js 22.15+** — uses the built-in Zstandard API. No native dependencies, no
  build step.
- **DSH session format v4**, the format written by current DeepSeek Harness builds.
- **Windows, macOS, Linux** — paths come from `os.homedir()` and can be overridden.

## Roadmap

- [x] Claude — local transcripts and data exports
- [ ] ChatGPT data export
- [ ] Gemini / Takeout
- [ ] Cursor and Copilot local sessions
- [ ] Saveable import presets (workspace + budget per source)
- [ ] CLI parity: `deepseekharness-importer import --all`

## Safety

- Reads only the selected source's data directory; writes only inside `DSH_HOME`.
- Every destructive write keeps a backup first.
- A slot that already holds a conversation is refused unless you explicitly
  confirm the overwrite (the UI asks; the API returns `409`).
- The HTTP server binds to loopback.

## Development

```bash
node --test "test/**/*.test.js"    # conversion, zstd round-trip, HTTP API
node src/cli.js --port 4599 --no-open
```

Layout:

```
src/
  cli.js              entry point, argument parsing, browser launch
  server.js           HTTP API + static file server
  core/claude.js      discovery and transcript parsing (Claude Code + export)
  core/sources.js     source registry (Claude now, more later)
  core/convert.js     turns → DSH v4 rows, budget, validation
  core/dsh.js         workspace registry, install, backups
  core/zstd.js        zstd frame scanner / encoder
  core/paths.js       home detection and project directory naming
  web/                dashboard (vanilla JS, shadcn-style CSS tokens)
```

## License

MIT © [Hossein Amiri](https://github.com/Hosseinamiri850)
