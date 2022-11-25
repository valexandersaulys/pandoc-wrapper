const { assert, expect } = require("chai");
const { describe, before, beforeEach, after, afterEach, it } = require("mocha");

const callWrapper = require("../callWrapper");

describe("callWrapper Tests", () => {
  it("works with one initial argument", () => {
    const foo = (arg1, arg2, arg3) => `${arg1}::${arg2}::${arg3}`;
    const gurr = callWrapper(foo, "one");
    assert.equal(gurr.run("two", "three"), "one::two::three");
  });
  it("works with no initial arguments", () => {
    const foo = (arg1, arg2, arg3) => `${arg1}::${arg2}::${arg3}`;
    const gurr = callWrapper(foo);
    assert.equal(gurr.run("two", "three", "four"), "two::three::four");
  });
  it("works with all initial arguments", () => {
    const foo = (arg1, arg2, arg3) => `${arg1}::${arg2}::${arg3}`;
    const gurr = callWrapper(foo, "five", "six", "seven");
    assert.equal(gurr.run(), "five::six::seven");
  });
  it("works with incomplete arguments", () => {
    const foo = (arg1, arg2, arg3) => `${arg1}::${arg2}::${arg3}`;
    const gurr = callWrapper(foo);
    assert.equal(gurr.run(), "undefined::undefined::undefined");
  });
});
