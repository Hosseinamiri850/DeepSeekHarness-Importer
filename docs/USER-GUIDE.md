# User guide

A step-by-step walkthrough for moving one Claude conversation into DeepSeek Harness (DSH).

## 1. What you need

| Requirement | Why | How to check |
|---|---|---|
| Node.js **22.15+** | Built-in Zstandard compression | `node --version` |
| DeepSeek Harness with at least one workspace | The importer writes into a real workspace | Open DSH once |
| Claude data on this machine | Source of the conversations | See step 3 |

No account, API key, or internet connection is required — everything runs locally.

## 2. Start the dashboard

```bash
node src/cli.js
```

Or, once published: `npx claude-to-dsh-importer`. The terminal prints the URL, and
your browser opens it. Use `--port 4173` for a fixed port, `--no-open` to stay in
the terminal.

The header shows two status pills:

- **Claude** — where your transcripts were found (`~/.claude/projects`).
- **DSH** — the harness home (`~/.dsh`), including whether the workspace registry
  exists. A red dot means DSH has not been opened on this machine yet, or
  `DSH_HOME` points elsewhere.

## 3. Where your Claude sessions come from

### Claude Code / Claude Desktop local agent

Every local agent session is a JSONL file:

```
~/.claude/projects/<encoded-project>/<session-uuid>.jsonl
```

On Windows that is `C:\Users\<you>\.claude\projects\…`. The dashboard discovers
these automatically; each row shows the project folder, the last-active date and
the number of turns. Subagent transcripts are hidden unless you enable
**Subagents**.

### Claude Desktop chats (the regular app)

Those live in the app's IndexedDB, which is not readable as a file. Export them
instead:

1. In Claude (web or desktop) go to **Settings → Privacy → Export data**.
   ([Anthropic help](https://support.claude.com/en/articles/9450526-export-your-claude-data))
2. Wait for the email, download the archive, extract `conversations.json`.
3. In the dashboard click **Upload export** and choose that file.
4. The conversations appear in the list with an `Export` badge.

> Exports are per-account and expire after 24 hours. Team/Enterprise plans require
> an owner to enable member exports.

## 4. Review before importing

Click any session to see:

- **Conversation** — the transcript the importer will keep, with human/assistant
  labels.
- **Stats** — turns, characters, estimated tokens, tool calls, file size, project,
  first and last activity.

Nothing is written at this point. Previewing is read-only.

## 5. Choose where it lands

The right panel controls the install:

| Control | Meaning |
|---|---|
| **Workspace** | A registered DSH workspace. The original project path is reused as the session's `cwd`, so the session appears under that workspace. |
| **Existing slot** | Reuses an *empty* session row that already exists in that workspace. The session shows up immediately, no restart. |
| **New session** | Allocates a fresh id and appends it to `workspace.json`. DSH must be restarted once to list it. |
| **History budget** | How many characters of the newest history to keep. The dropped turns are reported. |
| **Session title** | Shown in DSH's sidebar. Defaults to `Claude import · <project>`. |

### Why "Existing slot" is the default

DSH never scans its sessions folder: sidebar rows come from the workspace
registry. A brand-new log alone is invisible. Adopting an empty slot keeps the
registry untouched, so the import is visible as soon as you refresh DSH.

If a workspace has no empty slot, the panel says so. Two options:

1. Open DSH, press **New session** in that workspace, close it, and rescan here.
2. Switch to **New session** mode and restart DSH after importing.

## 6. Import

Press **Import session**. The result card reports turns kept, estimated tokens, the
new session id, and whether a restart is needed. Buttons let you copy the id or
open DSH.

If the chosen slot already contains a conversation, the dashboard asks before
overwriting. The previous log is always copied to:

```
~/.dsh/backups/claude-import/session-<id>-<timestamp>.jsonl.zstd
```

Registry edits keep a sibling backup: `workspace.json.backup-<timestamp>`.

## 7. See it in DSH

1. Refresh the DSH window (`F5`, or `Ctrl+Shift+R`).
2. Open the workspace you imported into.
3. Click the session and send a message to continue.

If you used **New session** mode, quit and reopen DeepSeek Harness first — the
registry is read at startup.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `This tool needs Node.js 22.15 or newer` | Old Node | Upgrade Node, or run with the runtime bundled with DSH |
| Dashboard lists no sessions | Claude Code never ran here | Import a `conversations.json` export instead |
| `DSH home missing` pill | DSH not opened yet, or custom home | Open DSH once, or start the importer with `DSH_HOME=<path>` |
| Imported session not in DSH | "New session" mode and no restart | Restart DSH, or import into an existing slot |
| "No empty slot" warning | All registered rows hold conversations | Create a new session in DSH, then rescan |
| Port already in use | Another instance running | `--port 4174` |
| Persian text looks reversed in the list | Mixed-direction truncation | Use the فارسی toggle; rows are RTL-isolated |
| Import refused with `409` | Slot already has a conversation | Confirm the overwrite in the dialog, or pick another slot |

## Restoring an earlier state

Every destructive write is reversible by hand:

```bash
# session log
copy ~/.dsh/backups/claude-import/<file>.jsonl.zstd ~/.dsh/sessions/<project>/<session>/session.v4.jsonl.zstd

# registry
copy ~/.dsh/storages/workspace.json.backup-<timestamp> ~/.dsh/storages/workspace.json
```

Then restart DSH if you changed the registry.

## FAQ

**Does anything leave my machine?** No. The server binds to `127.0.0.1` and makes no
outbound requests; the browser only talks to that local port.

**Does it modify Claude's data?** Never. `~/.claude` is opened read-only.

**Can I import the same session twice?** Yes — each import writes a new log (or
overwrites the chosen slot after confirmation). Ids stay stable per target.

**Are tool calls preserved?** No. Fabricating tool events would break DSH's reader
and mislead the model, so the importer keeps the conversation, not the tool state.

**What does a resumed session cost?** The retained history is replayed on every
request, so a 200k-character import costs roughly 55k tokens of context each turn.
Use the budget selector to keep it lean.

**Can I move back to Claude?** Not with this tool; DSH has `/export` for its own
logs, which you could reformat by hand. One-way by design.
