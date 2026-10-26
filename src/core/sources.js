/**
 * Source registry.
 *
 * A "source" is another AI tool whose conversations can be turned into a DSH
 * session. The dashboard lists every entry so the user can see where the product
 * is going, but only entries with `available: true` expose discovery and import.
 *
 * To add a tool later:
 *   1. flip `available` to true,
 *   2. give it `discover()` and `load()` implementations,
 *   3. return the same `{ turns, cwd, title, stats }` shape the Claude source does.
 * The converter, installer, and UI need no changes.
 */
import {
  discoverClaudeSessions,
  parseClaudeCodeFile,
  parseClaudeExport,
} from './claude.js';

export const SOURCES = [
  {
    id: 'claude',
    label: 'Claude',
    vendor: 'Anthropic',
    available: true,
    kind: 'local',
    description: 'Claude Code and Claude Desktop local sessions, plus account exports.',
    discover: ({ includeSidechains = false } = {}) =>
      discoverClaudeSessions({ includeSidechains }),
    load: (session) => parseClaudeCodeFile(session.file).turns,
    parseExport: (json) => parseClaudeExport(json),
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    vendor: 'OpenAI',
    available: false,
    kind: 'export',
    description: 'ChatGPT data export (conversations.json).',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    vendor: 'Google',
    available: false,
    kind: 'export',
    description: 'Google Takeout / Gemini activity export.',
  },
  {
    id: 'copilot',
    label: 'GitHub Copilot',
    vendor: 'GitHub',
    available: false,
    kind: 'local',
    description: 'Copilot CLI / chat transcripts.',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    vendor: 'Anysphere',
    available: false,
    kind: 'local',
    description: 'Cursor chat and composer sessions.',
  },
  {
    id: 'codex',
    label: 'Codex CLI',
    vendor: 'OpenAI',
    available: false,
    kind: 'local',
    description: 'Codex CLI rollout transcripts.',
  },
];

export const DEFAULT_SOURCE = 'claude';

export function sourceById(id) {
  return SOURCES.find((source) => source.id === id) || null;
}

export function sourceSummaries() {
  return SOURCES.map(({ id, label, vendor, available, kind, description }) => ({
    id,
    label,
    vendor,
    available,
    kind,
    description,
  }));
}

export function requireSource(id) {
  const source = sourceById(id || DEFAULT_SOURCE);
  if (!source) throw Object.assign(new Error(`unknown source: ${id}`), { statusCode: 400 });
  if (!source.available) {
    throw Object.assign(new Error(`source ${source.label} is not available yet`), { statusCode: 501 });
  }
  return source;
}
