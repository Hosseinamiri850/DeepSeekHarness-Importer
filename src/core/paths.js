/** Filesystem locations the importer cares about. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const isWindows = process.platform === 'win32';

export function claudeRoots() {
  const home = os.homedir();
  return {
    /** Claude Code / Claude Desktop "local agent" transcripts. */
    projects: process.env.CLAUDE_PROJECTS_DIR || path.join(home, '.claude', 'projects'),
    /** Optional CLI config file that can carry a custom projects directory. */
    settings: path.join(home, '.claude', 'settings.json'),
    home,
  };
}

/**
 * Resolve the DeepSeek Harness home directory: `DSH_HOME` wins, otherwise
 * `~/.dsh`. Returns existence flags so the UI can explain what is missing.
 */
export function dshHome(explicit) {
  const env = explicit || process.env.DSH_HOME || '';
  const dir = env ? path.resolve(env) : path.join(os.homedir(), '.dsh');
  const sessions = path.join(dir, 'sessions');
  const registry = path.join(dir, 'storages', 'workspace.json');
  return {
    dir,
    sessions,
    registry,
    exists: fs.existsSync(dir),
    hasSessions: fs.existsSync(sessions),
    hasRegistry: fs.existsSync(registry),
  };
}

export function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

/** DSH stores each workspace's cwd as a readable project directory name. */
export function projectDirName(cwd) {
  return `--${String(cwd).replace(/[\\/:]+/g, '-')}--`;
}
