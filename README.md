[![Build Status](https://travis-ci.com/adigital-org/slr-client.svg?branch=master)](https://travis-ci.com/adigital-org/slr-client)

SLR-Client
=========

A Node/JS client for the [Lista Robinson service](https://www.listarobinson.es/).

Usage
-----

This project uses Create React App for browser and desktop interfaces, so check their documentation for a guide.

CLI version requires Node, just run ./src/index.cli.js with Node.

*TL;DR*: just clone the repo, install dependencies with `yarn`, and start it with `yarn start`.

Developers guide
----------------

If you plan to build your own integration, we recommend checking the platform manual first, as it is the authoritative guide for integrators. This client can serve as a guide, but with no warranties of correctness, performance, or any other kind.

The most interesting parts for integrators are:
- Normalization: see `normalizers` at [SLRUtils.js](src/util/SLRUtils.js#L89)
- Hashing: see `record2hash` at [SLRUtils.js](src/util/SLRUtils.js#L108)
- API calling: see `sign` at [Signing.js](src/util/Signing.js#L12)

The tests can also be of great help, and we recommend testing your implementation against the same examples to make sure that the more uncommon cases are being processed as specified.

SLR-Client manual and legal
---------------------------
Manual and legal texts are written in GitHub Flavored Markdown.