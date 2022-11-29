const fs = require("fs");
const path = require("path");

const { execa, execaSync } = require("@esm2cjs/execa");

const callWrapper = require("./callWrapper");
const {
  ExecutableNotFound,
  StdErrorException,
  InputFileNotFound,
  InvalidFileFormat
} = require("./exceptions");

class PandocJS {
  constructor(options) {
    /**
     * options:
     *   binaryPath: str, path of pandoc. Defaults to /usr/bin/pandoc
     *   runAsAsync: bool, if true, returns promises, if false, runs sync. Defaults to false.
     */
    if (!options) options = {};
    this.binaryPath = process.env.PANDOC_BINARY_PATH
      ? process.env.PANDOC_BINARY_PATH
      : "/usr/bin/pandoc";
    if (!fs.existsSync(this.binaryPath))
      throw new ExecutableNotFound(
        `Could not find pandoc at path: '${this.binaryPath}'`
      );

    this.runAsAsync = false;
    if (options.runAsAsync != null) this.runAsAsync = options.runAsAsync;

    let tmp = callWrapper(execaSync, this.binaryPath);
    this.runSync = tmp.run;
    tmp = callWrapper(execa, this.binaryPath);
    this.run = tmp.run;
  }

  version() {
    if (this.runAsAsync) {
      return this.run(["--version"]).then((_output) => {
        let stdout = this._getStdOut(_output);
        return stdout.split("\n")[0];
      });
    } else {
      let stdout = this._getStdOut(this.runSync(["--version"]));
      let output = stdout.split("\n")[0];
      return output;
    }
    return null;
  }

  convert(inputPath, outputPath, outputFormat, inputFormat) {
    /**
     * Converts the path at `inputPath` to a format `outputFormat` at
     * `outputPath`
     *
     * @arg {inputPath} str path to file
     * @arg {outputPath} str output file path after conversion
     * @arg {outputFormat} str format of converted file
     * @arg {inputFormat} str format of input file. Optional, defaults to 'md'
     *     if not specified.
     */
    const _inputFormat = inputFormat ? inputFormat : "md";
    if (this.runAsAsync) {
      if (!fs.existsSync(inputPath)) {
        return new Promise((resolve, reject) => {
          reject(new InputFileNotFound(`Cannot find file at: '${inputPath}'`));
        });
      }
      return this.run([
        "-i",
        `${inputPath}`,
        `--to=${outputFormat}`,
        `--output=${outputPath}`,
        `--from=${_inputFormat}`
      ])
        .then((_output) => this._getStdOut(_output))
        .catch((err) => this._getStdOut(err));
    } else {
      if (!fs.existsSync(inputPath))
        throw new InputFileNotFound(`Cannot find file at: '${inputPath}'`);
      try {
        let _output = this.runSync([
          "-i",
          `${inputPath}`,
          `--to=${outputFormat}`,
          `--output=${outputPath}`,
          `--from=${_inputFormat}`
        ]);
        let stdout = this._getStdOut(_output);
        return stdout;
      } catch (err) {
        // skip, we handle errors elsewhere
        let _output = err;
        let stdout = this._getStdOut(_output);
        return stdout;
      }
    }
    return null;
  }

  async sendRawStream(stdin, outputPath, outputFormat, inputFormat) {
    /**
     * Write `stdin` to `pandoc` in place of reading a file. Used in place of
     * reading from a file.
     *
     * @arg {stdin} str string to push into standard input of your executable
     * @arg {outputPath} str output file path after conversion
     * @arg {outputFormat} str format of converted file
     * @arg {inputFormat} str format of input file. Optional, defaults to 'md'
     *     if not specified.
     */
    const _inputFormat = inputFormat ? inputFormat : "md";
    if (!this.runAsAsync)
      console.log(
        "WARNING: you have this marked to only run sync but pushing input is always ASYNC"
      );
    const subprocess = this.run([
      `--to=${outputFormat}`,
      `--from=${_inputFormat}`,
      `--output=${outputPath}`
    ]);
    subprocess.stdin.write(stdin + "\r\n");
    subprocess.stdin.end();
    return subprocess;
  }

  /* * * * * * Below are Private functions and shouldn't be called directly * * * */
  _getStdOut(output) {
    if (output.exitCode == 22) throw new InvalidFileFormat(output.stderr);
    else if (output.stderr != "") throw new StdErrorException(output.stderr);
    return output.stdout;
  }
}

module.exports = PandocJS;
