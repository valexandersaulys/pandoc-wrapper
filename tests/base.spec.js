const fs = require("fs");

const { assert, expect } = require("chai");
const { describe, before, beforeEach, after, afterEach, it } = require("mocha");

const PandocJS = require("../index");
const {
  ExecutableNotFound,
  StdErrorException,
  InputFileNotFound,
  InvalidFileFormat
} = require("../exceptions");

describe("Base Spec Tests", () => {
  it("defaults to sync", () => {
    const pandoc = new PandocJS();
    assert.isFalse(pandoc.runAsAsync);
  });
  it("can instantiate the class and get version", () => {
    const pandoc = new PandocJS({ runAsAsync: false });
    assert.include(pandoc.version(), "pandoc 2.");
  });
  it("can instantiate as Async and get version", () => {
    const pandoc = new PandocJS({ runAsAsync: true });
    return pandoc
      .version()
      .then((stdout) => assert.include(stdout, "pandoc 2."));
  });
});

describe("Can Write and Convert Files", () => {
  beforeEach(async () => {
    const fd = fs.openSync("/tmp/input.md", "w+");
    const sampleMarkdown = `
# My Header

* bullet parent one
  * bullet child
* bullet parent two
`.trim();
    fs.writeFileSync(fd, sampleMarkdown);
  });
  afterEach((done) => {
    try {
      fs.rmSync("/tmp/input.md");
      fs.rmSync("/tmp/output.html");
    } catch (err) {
      // When other tests fail, these don't get generated and useless
      // error logs result
    }
    done();
  });
  it("works synchronously", () => {
    const pandoc = new PandocJS({ runAsAsync: false });
    pandoc.convert("/tmp/input.md", "/tmp/output.html", "html");
    assert.equal(
      fs.readFileSync("/tmp/output.html", { encoding: "utf8", flag: "r" }),
      `<h1 id="my-header">My Header</h1>
<ul class="incremental">
<li>bullet parent one
<ul class="incremental">
<li>bullet child</li>
</ul></li>
<li>bullet parent two</li>
</ul>
`
    );
  });
  it("accepts variable arguments on pdf (sync)", () => {
    const pandoc = new PandocJS({ runAsAsync: false });
    pandoc.convert(
      "/tmp/input.md",
      "/tmp/output.pdf",
      "pdf",
      null,
      "geometry:margin=1in"
    );
    assert.isAbove(fs.statSync("/tmp/output.pdf").size, 0);
  });

  it("works asynchronously", () => {
    const pandoc = new PandocJS({ runAsAsync: true });
    return pandoc
      .convert("/tmp/input.md", "/tmp/output.html", "html")
      .then((stdout) => {
        assert.equal(
          fs.readFileSync("/tmp/output.html", { encoding: "utf8", flag: "r" }),
          `<h1 id="my-header">My Header</h1>
<ul class="incremental">
<li>bullet parent one
<ul class="incremental">
<li>bullet child</li>
</ul></li>
<li>bullet parent two</li>
</ul>
`
        );
      });
  });
  it("accepts variable arguments on pdf (async)", () => {
    const pandoc = new PandocJS({ runAsAsync: true });
    return pandoc
      .convert(
        "/tmp/input.md",
        "/tmp/output.pdf",
        "pdf",
        null,
        "geometry:margin=1in"
      )
      .then((stdout) => {
        assert.isAbove(fs.statSync("/tmp/output.pdf").size, 0);
      });
  });
  it("throws InputFileNotFound when Sync", () => {
    const pandoc = new PandocJS({ runAsAsync: false });
    assert.throws(
      () => pandoc.convert("/tmp/input___.md", "/tmp/output.html", "html"),
      InputFileNotFound
    );
  });
  it("throws InputFileNotFound when Async", async () => {
    const pandoc = new PandocJS({ runAsAsync: true });
    return pandoc
      .convert("/tmp/input___.md", "/tmp/output.html", "html")
      .then(() => assert.isFalse(true, "should not hit this"))
      .catch((err) => {
        assert.equal(err.name, "INPUT_FILE_NOT_FOUND");
      });
  });
  it("throws InvalidFileFormat when Sync", () => {
    const pandoc = new PandocJS({ runAsAsync: false });
    assert.throws(
      () => pandoc.convert("/tmp/input.md", "/tmp/output.html", "bbbb"),
      InvalidFileFormat
    );
  });
  it("throws InvalidFileFormat when Async", async () => {
    const pandoc = new PandocJS({ runAsAsync: true });
    return pandoc
      .convert("/tmp/input.md", "/tmp/output.html", "bbbb")
      .then(() => assert.isFalse(true, "Should not hit this"))
      .catch((err) => {
        assert.equal(err.name, "INVALID_FILE_FORMAT");
      });
  });
});

describe("Writing directly to stdin", () => {
  beforeEach(async () => {
    this.sampleMarkdown = `
# My Header

* bullet parent one
  * bullet child
* bullet parent two
`.trim();
  });

  it("works #1", async () => {
    const pandoc = new PandocJS({ runAsAsync: true });

    let A = await pandoc.sendRawStream(
      "# header",
      "/tmp/outputStdin.html",
      "html"
    );
    assert.isTrue(fs.existsSync("/tmp/outputStdin.html"));
    assert.equal(
      fs.readFileSync("/tmp/outputStdin.html", { encoding: "utf8", flag: "r" }),
      `<h1 id="header">header</h1>\n`
    );
    fs.rmSync("/tmp/outputStdin.html");
    assert.isFalse(fs.existsSync("/tmp/outputStdin.html"));
  });
  it("works #2", async () => {
    const pandoc = new PandocJS({ runAsAsync: true });

    let A = await pandoc.sendRawStream(
      this.sampleMarkdown,
      "/tmp/outputStdin2.html",
      "html"
    );
    assert.isTrue(fs.existsSync("/tmp/outputStdin2.html"));
    assert.equal(
      fs.readFileSync("/tmp/outputStdin2.html", {
        encoding: "utf8",
        flag: "r"
      }),
      `<h1 id="my-header">My Header</h1>
<ul>
<li>bullet parent one
<ul>
<li>bullet child</li>
</ul></li>
<li>bullet parent two</li>
</ul>\n`
    );
    fs.rmSync("/tmp/outputStdin2.html");
    assert.isFalse(fs.existsSync("/tmp/outputStdin2.html"));
  });
});
