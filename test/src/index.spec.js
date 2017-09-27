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
    return inst.createTable(fixd.postgres.createTable)
  })
  beforeEach(() => inst.create(Object.assign({}, fixd.postgres.testData)))
  afterEach(() => inst.query(`TRUNCATE ${inst.tableName}`))
  after(() => inst.pg.end())
  describe('query', () => {
    it('runs a query against the database when connection is good', () => {
      return inst.query('SELECT 1 + 1 AS number')
        .then((res) => {
          expect(res.rows[0].number).to.equal(2)
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
    let data
    beforeEach(() => {
      data = Object.assign({}, fixd.postgres.testData)
    })
    it('creates a new record based on object passed, escaping single quotes in string values', () => {
      data.fname = "first name's John"
      return inst.create(data)
        .then((res) => {
          expect(res.fname).to.equal('first name\'s John')
        })
    })
    it('rejects if record is not created', () => {
      sandbox.stub(inst, 'query').resolves({ rowCount: 0 })
      return expect(inst.create(data))
        .to.be.rejectedWith('Unable to create record')
    })
  })
  describe('read', () => {
    afterEach(() => { inst.sanitize = null })
    it('reads all when no query specified, calling existing sanitize method', () => {
      inst.sanitize = sandbox.spy(body => body)
      return inst.read()
        .then((res) => {
          expect(inst.sanitize).to.be.called()
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
      const query = 'fname=\'John\''
      const body = {
        fname: 'Bob',
        email: 'bsmith@gmail.com',
        age: 31
      }
      return inst.update(query, body)
        .then((res) => {
          expect(res.fname).to.equal('Bob')
        })
    })
    it('rejects if records are not updated', () => {
      sandbox.stub(inst, 'query').resolves({ rowCount: 0 })
      const query = 'fname=\'John\''
      const body = {
        fname: 'Bob',
        email: 'bsmith@gmail.com',
        address: { city: 'Fakeville' }
      }
      return expect(inst.update(query, body))
        .to.be.rejectedWith('Unable to update record(s)')
    })
  })
  describe('delete', () => {
    it('deletes record(s) based on query', () => {
      return inst.delete('fname=\'John\'')
        .then((res) => {
          expect(res.rowCount).to.be.at.least(1)
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
