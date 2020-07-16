#!/bin/bash
set -e
echo "Building server docker image.."
make build-server-docker
echo "Building client docker image.."
make build-client-docker
echo "Running server.."
make run-server-docker
echo "Running client.."
make run-client-docker