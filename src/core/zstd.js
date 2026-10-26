/**
 * Reader/writer for the container DeepSeek Harness uses for session logs:
 * a plain concatenation of independent Zstandard frames, each frame holding
 * one or more newline-delimited JSON rows.
 *
 * Node's `zlib.zstdDecompressSync` only decodes the first frame of a buffer,
 * so the frame boundaries have to be walked manually.
 */
import fs from 'node:fs';
import zlib from 'node:zlib';

const ZSTD_MAGIC = 0xfd2fb528;

/** Length in bytes of the Zstandard frame starting at `start`, or -1. */
export function frameLength(buf, start) {
  if (buf.length - start < 5) return -1;
  if (buf.readUInt32LE(start) !== ZSTD_MAGIC) return -1;
  let p = start + 4;
  const fhd = buf[p++];
  const fcsFlag = fhd >> 6;
  const singleSegment = (fhd >> 5) & 1;
  const checksum = (fhd >> 2) & 1;
  const didFlag = fhd & 3;
  if (!singleSegment) p += 1;
  p += [0, 1, 2, 4][didFlag];
  p += singleSegment ? [1, 2, 4, 8][fcsFlag] : [0, 2, 4, 8][fcsFlag];
  for (;;) {
    if (p + 3 > buf.length) return -1;
    const bh = buf.readUIntLE(p, 3);
    p += 3;
    const last = bh & 1;
    const type = (bh >> 1) & 3;
    const size = bh >> 3;
    p += type === 1 ? 1 : size;
    if (last) break;
    if (p > buf.length) return -1;
  }
  if (checksum) p += 4;
  return p > buf.length ? -1 : p - start;
}

/** Decode every frame in `buf` and return the concatenated text. */
export function decodeAllFrames(buf) {
  const parts = [];
  let off = 0;
  while (off < buf.length) {
    const len = frameLength(buf, off);
    if (len <= 0) throw new Error(`Invalid Zstandard frame at byte ${off}`);
    parts.push(zlib.zstdDecompressSync(buf.subarray(off, off + len)));
    off += len;
  }
  return Buffer.concat(parts).toString('utf8');
}

/** Read a session log file into an array of JSON rows. */
export function readRows(file) {
  return decodeAllFrames(fs.readFileSync(file))
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line));
}

/** Encode rows as one Zstandard frame per row. */
export function encodeRows(rows) {
  return Buffer.concat(
    rows.map((row) => zlib.zstdCompressSync(Buffer.from(`${JSON.stringify(row)}\n`, 'utf8'))),
  );
}
