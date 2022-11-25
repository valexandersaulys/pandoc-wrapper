#!/bin/bash

docker build . -t pandoc-js-test
EXIT_CODE=$?

if [ "$EXIT_CODE" -eq 0 ]; then 
    docker run pandoc-js-test
else
    echo "Build was not successful"
    exit $EXIT_CODE
fi;
