const fs = require("fs");

const { assert, expect } = require("chai");
const { describe, before, beforeEach, after, afterEach, it } = require("mocha");

describe("Smoke Test", () => {
  it("works", () => {
    assert.equal(1, 1);
    assert.isTrue(1 == 1);
    assert.isFalse(1 == 2);
    assert.notEqual(1, 2);
  });
});
