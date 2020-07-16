#!/bin/bash
set -e
rm -rf $ARTIFACTS_DIR/*  && \
cp -r src/. $ARTIFACTS_DIR  && \
touch .env && \
cp .env $ARTIFACTS_DIR/ && \
cd $ARTIFACTS_DIR  && \
rm -rf .next node_modules && \
export NEXT_PUBLIC_EDAV_SERVERLESS=1 && \
yarn install  && \
yarn run build  && \
mkdir -p serverless/$PAGE  && \
touch serverless/$PAGE/handler.js  && \
echo 'const compat = require("next-aws-lambda");' >  serverless/$PAGE/handler.js  && \
echo "const page = require(\".next/serverless/pages/$PAGE.js\");" >>  serverless/$PAGE/handler.js  && \
echo 'module.exports.render = async (event, context) => {' >>  serverless/$PAGE/handler.js  && \
echo '  const responsePromise = compat(page)(event, context);' >>  serverless/$PAGE/handler.js  && \
echo '  return responsePromise;' >>  serverless/$PAGE/handler.js  && \
echo '};' >>  serverless/$PAGE/handler.js  && \
rm -rf assets components pages utils
