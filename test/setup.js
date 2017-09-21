const chai = require('chai')
const dirtyChai = require('dirty-chai')
const chaiAsPromised = require('chai-as-promised')
const chaiSubset = require('chai-subset')
const mod = require('module')
const path = require('path')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const fixd = require('fixd')

// Chai
// ----------------------------------------
global.expect = chai.expect
chai.use(chaiAsPromised)
chai.use(dirtyChai)
chai.use(chaiSubset)
chai.use(sinonChai)

// Sinon
// ----------------------------------------
global.sinon = sinon
global.sandbox = sinon.sandbox.create()

if (global.afterEach) {
  afterEach(() => global.sandbox.restore())
}

// Fixd
// ----------------------------------------
global.fixd = fixd
require('require-dir')(path.resolve(__dirname, 'fixtures'))

// Node
// ----------------------------------------
// allow require() from project root
process.env.NODE_PATH = path.join(process.cwd(), process.env.NODE_PATH || '')
mod._initPaths()
