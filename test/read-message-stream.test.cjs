"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

// Mirrors readMessageStreamFully from api.js (XPCOM NetUtil is not available
// in node:test; we substitute a JS-level mock that walks the same code path).
function readMessageStreamFully(stream, maxBytes, readChunk) {
  let raw = "";
  for (let safety = 0; safety < 1024; safety++) {
    const available = stream.available();
    if (available <= 0) break;
    if (typeof maxBytes === "number" && raw.length + available > maxBytes) {
      throw new Error(`message too large (> ${maxBytes} bytes)`);
    }
    const chunk = readChunk(stream, available);
    if (!chunk || chunk.length === 0) break;
    raw += chunk;
  }
  return raw;
}

function makeChunkingStream(bytes, chunkSize) {
  let cursor = 0;
  return {
    available() { return bytes.length - cursor; },
    read(n) {
      const want = Math.min(n, chunkSize, bytes.length - cursor);
      const out = bytes.slice(cursor, cursor + want);
      cursor += want;
      return out;
    },
  };
}

const readChunk = (stream, available) => stream.read(available);

describe("readMessageStreamFully", () => {
  it("reads a fully-buffered stream in one pass", () => {
    const stream = makeChunkingStream("hello world", 100);
    assert.equal(readMessageStreamFully(stream, undefined, readChunk), "hello world");
  });

  it("loops to read a stream that surfaces bytes in chunks", () => {
    // Simulates the mbox quirk: stream.available() initially reports 600,
    // but more bytes become available after each read until 1132 total.
    const fullContent = "A".repeat(1132);
    const stream = makeChunkingStream(fullContent, 600);
    assert.equal(readMessageStreamFully(stream, undefined, readChunk).length, 1132);
  });

  it("returns empty string when stream has zero available", () => {
    const stream = makeChunkingStream("", 100);
    assert.equal(readMessageStreamFully(stream, undefined, readChunk), "");
  });

  it("throws when message exceeds maxBytes", () => {
    const stream = makeChunkingStream("X".repeat(2000), 500);
    assert.throws(
      () => readMessageStreamFully(stream, 1000, readChunk),
      /message too large/
    );
  });

  it("respects maxBytes exactly at boundary", () => {
    const stream = makeChunkingStream("X".repeat(1000), 500);
    assert.equal(readMessageStreamFully(stream, 1000, readChunk).length, 1000);
  });

  it("breaks the loop if read returns empty before EOF", () => {
    // Defensive: a misbehaving stream that claims available() > 0 but read
    // returns empty should not loop forever.
    let calls = 0;
    const stream = {
      available() { return 100; },
      read() { calls++; return ""; },
    };
    readMessageStreamFully(stream, undefined, readChunk);
    assert.equal(calls, 1);
  });

  it("safety bound caps pathological readers at 1024 iterations", () => {
    // A stream that always reports 1 byte available and returns 1 byte should
    // terminate by the safety bound, not run forever.
    let cursor = 0;
    const stream = {
      available() { return 1; },
      read() { cursor++; return "a"; },
    };
    const result = readMessageStreamFully(stream, undefined, readChunk);
    assert.equal(result.length, 1024);
  });
});
