class ExecutableNotFound extends Error {
  constructor(message) {
    super(message);
    this.name = "EXECUTABLE_NOT_FOUND";
    this.message = message;
  }
}

class StdErrorException extends Error {
  constructor(message) {
    super(message);
    this.name = "STDERR_EXCEPTION";
    this.message = message;
  }
}

class InputFileNotFound extends Error {
  constructor(message) {
    super(message);
    this.name = "INPUT_FILE_NOT_FOUND";
    this.message = message;
  }
}

class InvalidFileFormat extends Error {
  constructor(message) {
    super(message);
    this.name = "INVALID_FILE_FORMAT";
    this.message = message;
  }
}

module.exports = {
  ExecutableNotFound,
  StdErrorException,
  InputFileNotFound,
  InvalidFileFormat
};
