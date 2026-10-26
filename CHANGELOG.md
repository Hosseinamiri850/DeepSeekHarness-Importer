# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [0.2.0] — 2026-10-27

### Changed

- **Rebranded to DeepSeekHarness-Importer** — package name
  `deepseekharness-importer`, CLI `deepseekharness-importer`, new repository and
  documentation set.
- **Complete dashboard redesign** on a shadcn-style token system with DeepSeek's
  palette: light theme by default, dark theme, chat-style transcript bubbles,
  compact session rows, segmented install mode, inline result card.
- **Palette aligned with DeepSeek Harness' own theme tokens**
  (`dsh-client-ui-theme`): neutral-bluish surfaces (`#f9fafb` / `#151517`),
  near-black brand action in light and near-white in dark, DeepSeek blue
  (`#4176e6` / `#7aaaff`) as the only accent, DSH borders and radii.
- Repositioned the product around *sources*: the importer is no longer
  Claude-only by design.

### Added

- `src/core/sources.js` — a source registry that the API and the UI both read.
  Claude is the only available source; ChatGPT, Gemini, GitHub Copilot, Cursor and
  Codex CLI are listed as planned and are visible (disabled) in the source picker.
- `GET /api/sources`, and a `source` parameter on sessions, export, and import
  endpoints. Unavailable sources answer `501`.
- Dark/light theme persistence and `?lang=` / `?theme=` deep links for docs and
  screenshots.
- Test coverage for the source registry (`claude` is the only available source in
  this version).

### Fixed

- Session rows truncate correctly inside the sidebar.
- Persian/Arabic text keeps its direction inside an otherwise LTR interface.
- Binary-safe UTF-8 handling for the web assets (no BOM, no mojibake).

## [0.1.0] — 2026-10-27

### Added

- Local dashboard (English + فارسی) to browse Claude sessions and import any of
  them into DeepSeek Harness.
- Discovery of Claude Code / Claude Desktop local-agent transcripts in
  `~/.claude/projects` (subagent transcripts optional).
- Import of Claude account data exports (`conversations.json` from
  Settings → Privacy → Export data).
- Conversation preview and per-session stats.
- Character budget for retained history, keeping the newest turns.
- Two install modes: reuse a registered empty session slot (no restart) or create
  and register a new session id (one restart).
- DSH v4 session writer with Zstandard framing and structural validation before
  install.
- Backups for overwritten session logs and for the workspace registry.
- HTTP JSON API and static file server bound to loopback only.
- Test suite: conversion, budget, validation, zstd round-trip, end-to-end API.

### Known limitations

- Tool calls, attachments, and checkpoints are not migrated.
- Claude Desktop's regular chat history requires a manual data export.
- "New session" mode needs a DeepSeek Harness restart before the row appears.
