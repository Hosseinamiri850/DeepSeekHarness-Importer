/**
 * Turn an ordered conversation into DeepSeek Harness session rows
 * (format v4). Only plain user/assistant text is emitted — no fabricated
 * tool events — so the result is always a valid, resumable DSH history.
 */
import { randomUUID } from 'node:crypto';

export const DEFAULT_MAX_CHARS = 200000;

/** Estimate tokens the way the model sees them (rough, good enough for a warning). */
export function estimateTokens(chars) {
  return Math.round(chars / 3.6);
}

/** Keep the most recent turns that fit the character budget. */
export function fitTurns(turns, maxChars = DEFAULT_MAX_CHARS) {
  const total = turns.reduce((sum, turn) => sum + turn.user.length + turn.assistant.join('\n\n').length, 0);
  if (maxChars <= 0 || total <= maxChars) {
    return { kept: turns, dropped: 0, chars: total, truncated: false };
  }
  const kept = [];
  let chars = 0;
  for (let i = turns.length - 1; i >= 0; i -= 1) {
    const cost = turns[i].user.length + turns[i].assistant.join('\n\n').length;
    if (chars + cost > maxChars && kept.length > 0) break;
    chars += cost;
    kept.unshift(turns[i]);
  }
  return { kept, dropped: turns.length - kept.length, chars, truncated: kept.length < turns.length };
}

/**
 * Build the complete row list for a DSH session log.
 * `createdAt` is injected for reproducible tests.
 */
export function buildSessionRows({
  turns,
  cwd,
  maxChars = DEFAULT_MAX_CHARS,
  title = '',
  sessionId = `session-${randomUUID()}`,
  createdAt = Date.now(),
}) {
  const fitted = fitTurns(turns, maxChars);
  const rows = [
    {
      type: 'session',
      version: 4,
      id: sessionId,
      createdAt,
      cwd,
      isSeeded: false,
      delegationDepth: 0,
      agentPreset: 'standard',
    },
  ];

  let seq = 0;
  let time = createdAt;
  const emit = (type, data, extra) => {
    time += 1;
    rows.push({ type, seq: seq++, time, data, ...(extra || {}) });
    return seq - 1;
  };

  emit('permission/preset', { preset: 'workspace-write' });
  emit('sandbox/mode', { mode: 'workspace-write' });
  emit('approval/policy', { policy: 'ask' });

  fitted.kept.forEach((turn, index) => {
    const turnNo = index + 1;
    emit('turn/start', { turn: turnNo });
    emit('step/start', { turn: turnNo, step: 1 });
    const userSeq = emit(
      'user/message',
      {
        content: [{ type: 'text', text: turn.user }],
        source: { kind: 'user', importedFrom: 'claude' },
        role: 'user',
        id: randomUUID(),
      },
      { surfaceOp: 'append' },
    );
    if (index === 0) {
      emit('session/title', {
        title: title || 'Claude import',
        messageSeqs: [userSeq],
        source: { kind: 'fallback' },
      });
    }
    emit(
      'assistant/message',
      {
        turn: turnNo,
        step: 1,
        message: {
          role: 'assistant',
          content: [{ type: 'text', text: turn.assistant.join('\n\n') }],
          source: { kind: 'model', provider: 'deepseek-account', model: 'deepseek-flash', importedFrom: 'claude' },
          id: randomUUID(),
        },
        stream: [],
      },
      { surfaceOp: 'append' },
    );
    emit('step/end', { turn: turnNo, step: 1 });
    emit('turn/end', { turn: turnNo, reason: { kind: 'completed' } });
  });

  return { rows, fitted, turnCount: fitted.kept.length, chars: fitted.chars };
}

/** Structural checks that mirror the reader's validation for the events we emit. */
export function validateRows(rows) {
  const problems = [];
  const header = rows[0];
  if (!header || header.type !== 'session') problems.push('missing session header');
  if (header?.version !== 4) problems.push('header version must be 4');
  if (!/^session-[0-9a-f-]{36}$/.test(header?.id || '')) problems.push('header id must be session-<uuid>');
  if (typeof header?.cwd !== 'string' || !header.cwd) problems.push('header cwd is required');
  let expectedSeq = 0;
  let lastTurn = 0;
  for (const row of rows.slice(1)) {
    if (row.seq !== expectedSeq) problems.push(`seq gap at ${row.type}: expected ${expectedSeq}, got ${row.seq}`);
    expectedSeq += 1;
    if (row.type === 'assistant/message' && !Array.isArray(row.data?.stream)) {
      problems.push('assistant/message requires a stream array');
    }
    if (row.type === 'turn/start') lastTurn = row.data.turn;
    if (row.type === 'turn/end' && row.data.turn !== lastTurn) problems.push('turn/end out of order');
  }
  return problems;
}
