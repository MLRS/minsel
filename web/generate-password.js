#!/usr/bin/env node

// For generating hashed passwords to store in dictionary
// Usage: ./generate-password.js 1234

var password = process.argv[2]
if (!password) {
  console.log('Empty password')
  process.exit(1)
}
var config = require('./server-config')
var salted = config.salt + password
var shasum = require('crypto').createHash('sha1')
var hashed = shasum.update(salted).digest('hex')
console.log(hashed)
