/* eslint no-unused-expressions: 0 */
/* global expect, request, describe, it, before, after */
import '../setup';
import postgres from '../../src/index';

const config = {
  host: process.env.MODLI_POSTGRES_HOST,
  username: process.env.MODLI_POSTGRES_USERNAME,
  password: process.env.MODLI_POSTGRES_PASSWORD,
  database: process.env.MODLI_POSTGRES_DATABASE
};

const testInstance = new postgres(config);
testInstance.tableName = 'foo';

// Mock validation method, this is automatically done by the model
testInstance.validate = (body) => {
  // Test validation failure by passing `failValidate: true`
  if (body.failValidate) {
    return { error: true };
  }
  // Mock passing validation, return null
  return null;
};

// Mock sanitize method, this is automatically done by the model
testInstance.sanitize = (body) => {
  return body;
};

describe('postgres', () => {
  after((done) => {
    testInstance.query(`DROP TABLE ${testInstance.tableName};`)
      .then(() => {
        done();
      })
      .catch(done);
  });

  describe('query', () => {
    it('fails when a bad connection config is passed', (done) => {
      const testPostgres = new postgres({});
      testPostgres.query('')
        .catch((err) => {
          expect(err).to.be.an.object;
          done();
        });
    });
    it('fails when an invalid query is run', (done) => {
      const testPostgres = new postgres(config);
      testPostgres.query('`')
        .catch((err) => {
          expect(err).to.be.an.object;
          expect(err.name).to.equal('error');
          done();
        });
    });
    it('runs a query against the database when connection is good', (done) => {
      const testPostgres = new postgres(config);
      testPostgres.query('SELECT 1 + 1 AS number')
        .then((result) => {
          expect(result[0].number).to.equal(2);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('createTable', () => {
    it('creates a new table based on object passed (if not exists)', (done) => {
      testInstance.createTable({
        'id': [ 'serial', 'NOT NULL', 'PRIMARY KEY'],
        'fname': [ 'varchar(255)' ],
        'lname': [ 'varchar(255)' ],
        'email': [ 'varchar(255)' ]
      })
      .then((result) => {
        expect(result).to.be.an.object;
        done();
      })
      .catch((err) =>  done(err));
    });
  });

  describe('create', () => {
    it('fails when validation does not pass', (done) => {
      testInstance.create({
        failValidate: true
      })
      .catch((err) => {
        expect(err).to.have.property('error');
        done();
      });
    });
    it('creates a new record based on object passed', (done) => {
      testInstance.create({
        fname: 'John',
        lname: 'Smith',
        email: 'jsmith@gmail.com'
      })
      .then((result) => {
        expect(result.insertId).to.be.a.number;
        done();
      })
      .catch((err) =>  done(err));
    });
  });

  describe('read', () => {
    it('reads all when no query specified', (done) => {
      testInstance.read()
        .then((result) => {
          expect(result).to.be.an.array;
          done();
        })
        .catch((err) =>  done(err));
    });
    it('reads specific records when query supplied', (done) => {
      testInstance.read('fname=\'John\'', 1)
        .then((result) => {
          expect(result).to.be.an.array;
          done();
        })
        .catch((err) =>  done(err));
    });
    it('fails when a bad query is provided', (done) => {
      testInstance.read('`fart=`knocker')
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          done();
        });
    });
  });

  describe('update', () => {
    it('fails when validation does not pass', (done) => {
      testInstance.update({}, {
        failValidate: true
      })
      .catch((err) => {
        expect(err).to.have.property('error');
        done();
      });
    });
    it('updates record(s) based on query and body', (done) => {
      testInstance.update('fname=\'John\'', {
        fname: 'Bob',
        email: 'bsmith@gmail.com'
      }, 1)
        .then(() => {
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('delete', () => {
    it('deletes record(s) based on query', (done) => {
      testInstance.delete('fname=\'Bob\'')
        .then(() => {
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('extend', () => {
    it('extends the adapter with a custom method', () => {
      // Extend
      testInstance.extend('sayFoo', () => {
        return 'foo';
      });
      // Execute
      expect(testInstance.sayFoo()).to.equal('foo');
    });
  });
});
