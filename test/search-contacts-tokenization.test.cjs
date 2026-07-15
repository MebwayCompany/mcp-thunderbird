"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

// Mirrors the XPCOM-free matcher inside searchContacts; email represents card.primaryEmail.
function matchesContactQuery(card, query) {
  const lowerQuery = (query || "").toLowerCase();
  const hasQuery = !!lowerQuery;
  let queryTokens = [];
  if (hasQuery) {
    queryTokens = lowerQuery.split(/[,\s]+/).filter(Boolean);
  }
  const failedQuery = hasQuery && queryTokens.length === 0;

  const email = (card.email || "").toLowerCase();
  const displayName = (card.displayName || "").toLowerCase();
  const firstName = (card.firstName || "").toLowerCase();
  const lastName = (card.lastName || "").toLowerCase();
  const fields = [email, displayName, firstName, lastName];

  if (failedQuery) return false;
  return !hasQuery || queryTokens.every(token =>
    fields.some(field => field.includes(token))
  );
}

describe("searchContacts tokenization", () => {
  const klocok = {
    displayName: "Klocok, Viliam",
    firstName: "Viliam",
    lastName: "Klocok",
    email: "viliam.klocok@gmail.com",
  };

  it("matches reporter's CardDAV displayName cases", () => {
    assert.equal(matchesContactQuery(klocok, "Klocok Viliam"), true);
    assert.equal(matchesContactQuery(klocok, "Viliam Klocok"), true);
    assert.equal(matchesContactQuery({ displayName: "Guedes, Robson" }, "Robson Guedes"), true);
    assert.equal(matchesContactQuery({ displayName: "Guedes, Robson" }, "Guedes Robson"), true);
  });

  it("preserves single-token substring matching", () => {
    assert.equal(matchesContactQuery(klocok, "Viliam"), true);
    assert.equal(matchesContactQuery(klocok, "Klocok"), true);
    assert.equal(matchesContactQuery(klocok, "viliam.klocok@gmail.com"), true);
  });

  it("splits comma-included queries into AND tokens", () => {
    assert.equal(matchesContactQuery(klocok, "Klocok, Viliam"), true);
  });

  it("requires every token to appear somewhere", () => {
    const smith = { displayName: "Smith, John", firstName: "John", lastName: "Smith" };

    assert.equal(matchesContactQuery(smith, "John Doe"), false);
  });

  it("handles empty and failed queries", () => {
    assert.equal(matchesContactQuery({}, ""), true);
    assert.equal(matchesContactQuery(klocok, "   "), false);
    assert.equal(matchesContactQuery(klocok, ",,,"), false);
    assert.equal(matchesContactQuery(klocok, " , "), false);
  });

  it("remains case-insensitive", () => {
    assert.equal(matchesContactQuery(klocok, "KLOCOK"), true);
  });
});
