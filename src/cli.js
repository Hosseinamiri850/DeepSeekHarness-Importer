#!/usr/bin/env node
/** Entry point: `deepseekharness-importer [--port 4173] [--no-open]`. */
import { spawn } from 'node:child_process';
import zlib from 'node:zlib';
import { startServer } from './server.js';

const VERSION = '0.2.0';

function parseArgs(argv) {
  const options = { port: 0, open: true, host: '127.0.0.1' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--version' || arg === '-v') options.version = true;
    else if (arg === '--no-open') options.open = false;
    else if (arg === '--port') options.port = Number(argv[++i]) || 0;
    else if (arg.startsWith('--port=')) options.port = Number(arg.split('=')[1]) || 0;
    else if (arg === '--host') options.host = argv[++i] || '127.0.0.1';
    else if (arg.startsWith('--host=')) options.host = arg.split('=')[1] || '127.0.0.1';
  }
  return options;
}

function openBrowser(url) {
  try {
    if (process.platform === 'win32') spawn('cmd', ['/c', 'start', '""', url], { detached: true, stdio: 'ignore' }).unref();
    else if (process.platform === 'darwin') spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    else spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
  } catch {
    /* opening a browser is best-effort */
  }
}

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  console.log(`DeepSeekHarness-Importer ${VERSION}

Bring conversations from other AI tools into DeepSeek Harness as resumable
sessions. This version supports Claude; more sources are planned.

Usage
  deepseekharness-importer [options]

Options
  -p, --port <port>   listen on a fixed port (default: a free port)
      --host <host>   loopback address to bind (default: 127.0.0.1)
      --no-open       do not open the dashboard automatically
  -v, --version       print the version
  -h, --help          show this help

Requires Node.js 22.15+ (for the built-in Zstandard API).
`);
  process.exit(0);
}

if (options.version) {
  console.log(VERSION);
  process.exit(0);
}

if (typeof zlib.zstdCompressSync !== 'function') {
  console.error(
    `This tool needs Node.js 22.15 or newer for Zstandard support (running ${process.version}).\n` +
      'Upgrade Node.js and try again: https://nodejs.org',
  );
  process.exit(1);
}

const { url } = await startServer({ port: options.port, host: options.host });
console.log(`\n  DeepSeekHarness-Importer  ${VERSION}`);
console.log(`  Dashboard: ${url}`);
console.log('  Press Ctrl+C to stop.\n');
if (options.open) openBrowser(url);
