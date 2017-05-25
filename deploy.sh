#!/usr/bin/env bash

PATH=$PATH:$(yarn bin)
set -x

# Production build
ng build --prod

# 22:36
sw-precache --config=sw-precache-config.js --verbose

firebase deploy
