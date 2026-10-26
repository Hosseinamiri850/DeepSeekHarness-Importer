import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSessionRows, fitTurns, validateRows, estimateTokens } from '../src/core/convert.js';
import { encodeRows, decodeAllFrames } from '../src/core/zstd.js';

const turns = [
  { user: 'hello', assistant: ['hi there'] },
  { user: 'why?', assistant: ['because'] },
  { user: 'thanks', assistant: ['anytime'] },
];

test('fitTurns keeps the newest turns within the budget', () => {
  const fitted = fitTurns(turns, 12);
  assert.equal(fitted.truncated, true);
  assert.ok(fitted.kept.length < turns.length);
  assert.equal(fitted.kept.at(-1).user, 'thanks');
  assert.equal(fitted.dropped, turns.length - fitted.kept.length);
});

test('fitTurns keeps everything when under budget', () => {
  const fitted = fitTurns(turns, 10_000);
  assert.equal(fitted.kept.length, 3);
  assert.equal(fitted.dropped, 0);
});

test('buildSessionRows emits a valid, resumable v4 log', () => {
  const sessionId = 'session-11111111-2222-3333-4444-555555555555';
  const { rows, turnCount } = buildSessionRows({
    turns,
    cwd: 'C:\\work\\demo',
    sessionId,
    createdAt: 1700000000000,
    title: 'Demo import',
  });

  assert.equal(turnCount, 3);
  assert.deepEqual(validateRows(rows), []);
  assert.equal(rows[0].id, sessionId);
  assert.equal(rows[0].version, 4);
  assert.equal(rows.filter((row) => row.type === 'user/message').length, 3);
  assert.equal(rows.filter((row) => row.type === 'assistant/message').length, 3);
  assert.equal(rows.filter((row) => row.type === 'session/title').length, 1);

  const seqs = rows.slice(1).map((row) => row.seq);
  assert.deepEqual(seqs, [...seqs.keys()]);
});

test('validateRows reports a missing stream and seq gaps', () => {
  const { rows } = buildSessionRows({ turns, cwd: 'C:\\x', createdAt: 1 });
  const assistant = rows.find((row) => row.type === 'assistant/message');
  delete assistant.data.stream;
  rows.splice(5, 1); // drop a middle row without renumbering
  const problems = validateRows(rows);
  assert.ok(problems.some((problem) => problem.includes('stream array')));
  assert.ok(problems.some((problem) => problem.includes('seq gap')));
});

test('zstd rows survive an encode/decode round trip', () => {
  const { rows } = buildSessionRows({ turns, cwd: 'C:\\work', createdAt: 5 });
  const decoded = decodeAllFrames(encodeRows(rows))
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  assert.deepEqual(decoded, rows);
});

test('estimateTokens is proportional to characters', () => {
  assert.ok(estimateTokens(3600) >= 900);
});
