# Contributing

Thanks for helping. This project is deliberately small: **no runtime
dependencies**, plain ESM, a vanilla-JS dashboard, and a test suite you can run in
one command.

## Setup

```bash
git clone https://github.com/Hosseinamiri850/DeepSeekHarness-Importer.git
cd DeepSeekHarness-Importer
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
| `src/core/sources.js` | Source registry: one entry per AI tool |
| `src/core/claude.js` | Claude discovery and transcript parsing |
| `src/core/convert.js` | Turns → DSH v4 rows, budget, structural validation |
| `src/core/dsh.js` | Workspace registry, install, backups |
| `src/core/zstd.js` | Zstandard frame scanner/encoder |
| `src/core/paths.js` | Home detection, project directory naming |
| `src/web/` | Dashboard HTML/CSS/JS (no build step) |

## Adding a source

The product is built around a registry, so a new tool is one file plus one entry:

1. Create `src/core/<tool>.js` exporting at least:
   - `discover(options) → session[]` — each item needs `id`, `name`, `project`,
     `projectHint`, `cwd`, `mtime`, `sizeBytes`, `stats` (`turns`, `chars`,
     `messages`, `toolCalls`), and `sourceLabel`.
   - `load(session) → turns` — `[{ user: string, assistant: string[] }]`.
   - optional `parseExport(json) → session[]` for file-based exports.
2. Add an entry to `SOURCES` in `src/core/sources.js` with
   `available: true`, `kind: 'local' | 'export'`, the functions above, and a short
   description. Keep unavailable tools listed with `available: false`.
3. Nothing else changes: the converter, the installer, the API, and the dashboard
   read the registry.

Acceptance for a new source:

- `GET /api/sessions?source=<id>` lists it, and the UI picker enables it.
- `POST /api/import` produces a log that passes `validateRows`.
- A test in `test/` covers discovery plus one end-to-end import, using
  `CLAUDE_PROJECTS_DIR`-style environment overrides so the suite never touches
  real user data.

## Rules of the road

1. **Never write outside `DSH_HOME`.** Source directories stay read-only.
2. **Back up before overwriting** a log or the registry.
3. **Do not fabricate DSH events.** Only events the reader accepts are emitted;
   tool calls are not synthesised.
4. **Keep the UI dependency-free.** No bundler, no framework, no CDN assets.
5. **Bilingual parity.** Any user-facing string goes into both `en` and `fa`
   dictionaries in `src/web/app.js`.
6. **Test the invariant, not the implementation.** Extend `test/` with a failing
   case first.

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
- Mention the source and DSH version you tested against.

## Reporting bugs

Include: OS, `node --version`, DSH version, the exact endpoint/UI step, and the
error text. Redact session ids and paths if they are sensitive.
