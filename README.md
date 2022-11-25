# `pandoc-wrapper` 

Pandoc Wrapper for NodeJS. 

Requires the `pandoc` executable to be installed. Normally this is in
`/usr/bin/pandoc`. It can be specified in the environmental variable
`PANDOC_BINARY_PATH` if necesary.

```sh
sudo apt-get install pandoc   # Ubuntu (most versions of Debian)
apk add --no-cache pandoc     # Alpine v3.17+
npm i pandoc-wrapper
```

## Examples of Usage

It's suggested you look at `tests/` for examples. 

`pandoc-wrapper` can be used in both async and sync flavors. It defaults to
sync if not specified. 

### Sync

```js
const PandocJS = require("pandoc-wrapper");

// convert a file on disk already and write out
const pandoc = new PandocJS({ runAsAsync: false });
pandoc.convert("/tmp/input.md", "/tmp/output.html", "html");
```

Note: writing to the filestream is not practically possible in
Synchronous execution. This is because of how [child processes in node
work](https://nodejs.org/api/child_process.html#subprocessstdin). You
can run it anyway even if async but a warning will be logged to
console if you do. 

```js
const PandocJS = require("pandoc-wrapper");

(async () => {
  const pandoc = new PandocJS({ runAsAsync: false });
  await pandoc.sendRawStream(
      "# header",
      "/tmp/outputStdin.html",
      "html"
    )
})();
```


### Async

```js
const PandocJS = require("pandoc-wrapper");

const pandoc = new PandocJS({ runAsAsync: true });

// convert from file on-disk
pandoc
  .convert("/tmp/input.md", "/tmp/output.html", "bbbb")
  .then(() => {
    // do things with your file, there is no return value
  })
  .catch((err) => {
    // some helpful, build-in exceptions
    if(err.name == "EXECUTABLE_NOT_FOUND")
      console.log("Executable for pandoc not found");
    else if(err.name == "INPUT_FILE_NOT_FOUND")    
      console.log("Could not find input file specified");
    else if(err.name == "INVALID_FILE_FORMAT")
      console.log("File Format specified (e.g. 'html') was not correct");
    else if(err.name == "STDERR_EXCEPTION")
      console.log("All other exceptions generated");
  })    
```


## Testing

```
npm run test
npm run test:one -- tests/name.of.test.js
```

You can optionally run the tests in Docker. 

```
bash run-tests-docker.sh
```

This is particularly helpful if you plan to use this in a container
context. 


## Caveats

No support for Windows either now or in the future. This is because I
don't own a Windows machine. I'll accept relevant pull requests around
it somebody else is interested in that. 


## License

[MIT](https://mit-license.org/)
