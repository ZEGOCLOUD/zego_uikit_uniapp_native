const path = require('path')
const { rimraf } = require('rimraf')
const fs = require('fs');
const rawPackageJson = require('../package.json')
const packageJson = path.join(__dirname, '../src/config/package.json')

rimraf(path.resolve('../dist'))

// 写入package.json的version
fs.writeFileSync(packageJson, JSON.stringify({ version: rawPackageJson.version }, null, 2))