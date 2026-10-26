# Contributing

Thanks for helping. This project is deliberately small: **no runtime
dependencies**, plain ESM, a vanilla-JS dashboard, and a test suite you can run in
one command.

## Setup

```bash
git clone https://github.com/Hosseinamiri850/Claude-to-DeepSeekHarness-Importer.git
cd Claude-to-DeepSeekHarness-Importer
node --version          # must be >= 22.15 (built-in zstd)
node --test "test/**/*.test.js"
node src/cli.js --port 4599 --no-open
```

There is nothing to install: `package.json` has no `dependencies`.

## Layout

| Path | Responsibility |
|---|---|
| `src/cli.js` | Argument parsing, Node version guard, browser launch |
| `src/server.js` | HTTP API, static files, request validation |
| `src/core/claude.js` | Discovery and transcript parsing (Claude Code + export) |
| `src/core/convert.js` | Turns → DSH v4 rows, budget, structural validation |
| `src/core/dsh.js` | Workspace registry, install, backups |
| `src/core/zstd.js` | Zstandard frame scanner/encoder |
| `src/core/paths.js` | Home detection, project directory naming |
| `src/web/` | Dashboard HTML/CSS/JS (no build step) |

## Rules of the road

1. **Never write outside `DSH_HOME`.** `~/.claude` stays read-only.
2. **Back up before overwriting** a log or the registry.
3. **Do not fabricate DSH events.** Only the events the reader accepts are emitted;
   tool calls are not synthesised.
4. **Keep the UI dependency-free.** No bundler, no framework, no CDN assets.
5. **Bilingual parity.** Any user-facing string goes into both `en` and `fa`
   dictionaries in `src/web/app.js`.
6. **Test the invariant, not the implementation.** New behaviour should extend
   `test/` with a failing case first.

## Encoding hygiene

All text files are UTF-8 **without BOM**. On Windows, avoid round-tripping files
through PowerShell `Get-Content`/`Set-Content`; use an editor that preserves UTF-8,
or the mojibake in Persian strings will come back.

## Commit style

Conventional-ish prefixes: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`,
`chore:`. Keep the subject imperative and under ~72 characters.

## Pull requests

- State the user-visible change in one sentence.
- List the commands you ran (`node --test "test/**/*.test.js"`, manual import).
- Include a screenshot when the dashboard changes.
- Mention any DSH version you tested against.

## Reporting bugs

Include: OS, `node --version`, DSH version, the exact endpoint/UI step, and the
error text. Redact session ids and paths if they are sensitive.
