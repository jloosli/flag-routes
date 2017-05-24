#!/usr/bin/env bash

PATH=$PATH:$(npm bin)
set -x

# Production build
ng build --prod

# Copy prebuilt worker into site
cp node_modules/@angular/service-worker/bundles/worker-basic.min.js dist/

# Serve
cd dist
http-server
