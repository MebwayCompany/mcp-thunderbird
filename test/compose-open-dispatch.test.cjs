"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

// Mirrors shouldUseDirectComposeOpen from api.js. XPCOM compose services are not
// available in Node, so this covers only the dispatch decision.
function shouldUseDirectComposeOpen(compType, compTypes) {
  return compType === compTypes.ForwardInline;
}

describe("Compose open dispatch", () => {
  const compTypes = {
    New: 0,
    Reply: 1,
    ReplyAll: 2,
    ForwardInline: 3,
    ForwardAsAttachment: 4,
  };

  it("uses direct OpenComposeWindow for inline forwards", () => {
    assert.equal(shouldUseDirectComposeOpen(compTypes.ForwardInline, compTypes), true);
  });

  it("keeps other compose types on the params path", () => {
    assert.equal(shouldUseDirectComposeOpen(compTypes.New, compTypes), false);
    assert.equal(shouldUseDirectComposeOpen(compTypes.Reply, compTypes), false);
    assert.equal(shouldUseDirectComposeOpen(compTypes.ReplyAll, compTypes), false);
    assert.equal(shouldUseDirectComposeOpen(compTypes.ForwardAsAttachment, compTypes), false);
  });
});
