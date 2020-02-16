#!/bin/bash

set -e

mkdir /tmp/electron-repo
rsync -ar --exclude='/electron-repo/node_modules' --exclude='/electron-repo/dist' --exclude='/electron-repo/build' --exclude='/electron-repo/.git' --exclude='/electron-repo/.idea' /electron-repo /tmp
cd /tmp/electron-repo
yarn
yarn electron-build
mkdir -p /electron-repo/build/dist
mv /tmp/electron-repo/build/dist/* /electron-repo/build/dist/
