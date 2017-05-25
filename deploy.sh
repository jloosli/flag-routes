#!/usr/bin/env bash

PATH=$PATH:$(npm bin)
set -x

# Production build
ng build --prod

# Copy prebuilt worker into site
cp node_modules/@angular/service-worker/bundles/worker-basic.min.js dist/

# 22:36
yarn run ngu-sw-manifest -- --module src/app/app.module.ts


# Serve
cd dist
http-server
