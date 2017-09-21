/* eslint no-unused-expressions: 0 */
require('../setup')
const PostgresAdapter = require('src')

describe('postgres', () => {
  let inst
  before(() => {
    inst = new PostgresAdapter(fixd.postgres.config)
    inst.tableName = 'foo'
    // Mock validation method, this is automatically done by the model
    inst.validate = (body) => Promise.resolve(body)
    // Mock sanitize method, this is automatically done by the model
    inst.sanitize = (body) => body
  })
  after(() => inst.pg.end())
  describe('query', () => {
    it('runs a query against the database when connection is good', () => {
      return inst.query('SELECT 1 + 1 AS number')
        .then((result) => {
          expect(result.rows[0].number).to.equal(2)
        })
    })
    it('fails when invalid query is run', () => {
      return expect(inst.query('`')).to.be.rejectedWith(Error)
    })
  })
  describe('createTable', () => {
    it('creates a new table based on object passed (if not exists)', () => {
      return inst.createTable(fixd.postgres.createTable)
        .then((res) => {
          expect(res.command).to.equal('CREATE')
        })
    })
  })
  describe('create', () => {
    it('creates a new record based on object passed', () => {
      return inst.create(fixd.postgres.testData)
        .then((res) => {
          expect(res).to.containSubset(fixd.postgres.testData)
        })
    })
    it('rejects if record is not created', () => {
      sandbox.stub(inst, 'query').resolves({ rowCount: 0 })
      return expect(inst.create(fixd.postgres.testData))
        .to.be.rejectedWith('Unable to create record')
    })
  })
  describe('read', () => {
    it('reads all when no query specified', () => {
      return inst.read()
        .then((res) => {
          expect(res.length).to.equal(1)
          expect(res[0].email).to.equal(fixd.postgres.testData.email)
        })
    })
    it('reads specific records when query supplied', () => {
      return inst.read('fname=\'John\'', 1)
        .then((res) => {
          expect(res.length).to.equal(1)
          expect(res[0].email).to.equal(fixd.postgres.testData.email)
        })
    })
    it('fails when a bad query is provided', () => {
      return expect(inst.read('`')).to.be.rejectedWith(Error)
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
