/*
  SLR-Client CLI CommonJS to ES6 modules adapter
 */

require = require("esm")(module)
module.exports = require("./index.es6.cli.js")
