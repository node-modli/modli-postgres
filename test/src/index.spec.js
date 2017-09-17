/* eslint no-unused-expressions: 0 */
/* global expect, describe, it, beforeEach, afterEach */
require('../setup')
const PostgresAdapter = require('../../src/index')

const config = {
  host: process.env.MODLI_POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB
}

// Test record
const testData = {
  fname: 'John',
  lname: 'Smith',
  email: 'jsmith@gmail.com'
}

describe('postgres', () => {
  let inst
  beforeEach(() => {
    inst = new PostgresAdapter(config)
    inst.tableName = 'foo'
    // Mock validation method, this is automatically done by the model
    inst.validate = (body) => Promise.resolve(body)
    // Mock sanitize method, this is automatically done by the model
    inst.sanitize = (body) => body
  })
  afterEach(() => {
    inst.query(`DROP TABLE ${inst.tableName}`)
  })
  describe('query', () => {
    it('fails when invalid query is run', () => {
      return inst.query('`')
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error)
        })
    })
    it('runs a query against the database when connection is good', () => {
      return inst.query('SELECT 1 + 1 AS number')
        .then((result) => {
          expect(result.rows[0].number).to.equal(2)
        })
    })
  })
  describe('createTable', () => {
    it('creates a new table based on object passed (if not exists)', () => {
      return inst.createTable({
        'id': [ 'serial', 'NOT NULL', 'PRIMARY KEY' ],
        'fname': [ 'varchar(255)' ],
        'lname': [ 'varchar(255)' ],
        'email': [ 'varchar(255)' ]
      })
      .then((result) => {
        expect(result.command).to.equal('CREATE')
      })
    })
  })
  describe('create', () => {
    it('creates a new record based on object passed', () => {
      return inst.create(testData)
        .then((result) => {
          expect(result.command).to.equal('INSERT')
          expect(result.rowCount).to.equal(1)
        })
    })
  })
  describe('read', () => {
    it('reads all when no query specified', () => {
      return inst.read()
        .then((result) => {
          expect(result.length).to.equal(1)
          expect(result[0].email).to.equal(testData.email)
        })
    })
    it('reads specific records when query supplied', () => {
      return inst.read('fname=\'John\'', 1)
        .then((result) => {
          expect(result.length).to.equal(1)
          expect(result[0].email).to.equal(testData.email)
        })
    })
    it('fails when a bad query is provided', () => {
      return inst.read('`fart=`knocker')
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error)
        })
    })
  })
  describe('update', () => {
    it('updates record(s) based on query and body', () => {
      return inst.update('fname=\'John\'', {
        fname: 'Bob',
        email: 'bsmith@gmail.com'
      }, 1)
      .then((result) => {
        expect(result.command).to.equal('UPDATE')
        expect(result.rowCount).to.equal(1)
      })
    })
  })
  describe('delete', () => {
    it('deletes record(s) based on query', () => {
      return inst.delete('fname=\'Bob\'')
        .then((result) => {
          expect(result.rowCount).to.equal(1)
        })
    })
  })
  describe('extend', () => {
    it('extends the adapter with a custom method', () => {
      // Extend
      inst.extend('sayFoo', () => 'foo')
      // Execute
      expect(inst.sayFoo()).to.equal('foo')
    })
  })
})
