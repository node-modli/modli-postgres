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
});
