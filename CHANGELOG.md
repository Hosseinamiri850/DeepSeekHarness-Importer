# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [0.1.0] — 2026-10-27

### Added

- Local dashboard (English + فارسی, dark/light) to browse Claude sessions and
  import any of them into DeepSeek Harness.
- Discovery of Claude Code / Claude Desktop local-agent transcripts in
  `~/.claude/projects` (subagent transcripts optional).
- Import of Claude account data exports (`conversations.json` from
  Settings → Privacy → Export data).
- Conversation preview and per-session stats (turns, characters, estimated
  tokens, tool calls, size, project).
- Character budget for retained history, keeping the newest turns.
- Two install modes: reuse a registered empty session slot (no restart) or create
  and register a new session id (one restart).
- DSH v4 session writer with Zstandard framing and structural validation before
  install.
- Backups for overwritten session logs and for the workspace registry.
- HTTP JSON API and static file server bound to loopback only.
- Test suite: conversion, budget, validation, zstd round-trip, and an end-to-end
  API test with a temporary DSH home.

### Known limitations

- Claude tool calls, attachments, and checkpoints are not migrated.
- Claude Desktop's regular chat history requires a manual data export.
- "New session" mode needs a DeepSeek Harness restart before the row appears.
