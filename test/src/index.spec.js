/* eslint no-unused-expressions: 0 */
/* global expect, request, describe, it, before, after */
import '../setup';
import postgres from '../../src/index';

describe('postgres', () => {
  const config = {
    host: process.env.MODLI_POSTGRES_HOST,
    username: process.env.MODLI_POSTGRES_USERNAME,
    password: process.env.MODLI_POSTGRES_PASSWORD,
    database: process.env.MODLI_POSTGRES_DATABASE
  };

  describe('query', () => {
    it('fails when a bad connection config is passed', (done) => {
      const testConstruct = new postgres({});
      testConstruct.query('')
        .catch((err) => {
          expect(err).to.be.an.object;
          expect(err.code).to.equal('ECONNREFUSED');
          done();
        });
    });
    it('fails when an invalid query is run', (done) => {
      const testConstruct = new postgres(config);
      testConstruct.query('`')
        .catch((err) => {
          expect(err).to.be.an.object;
          expect(err.name).to.equal('error');
          done();
        });
    });
    it('runs a query against the database when connection is good', (done) => {
      const testConstruct = new postgres(config);
      testConstruct.query('SELECT 1 + 1 AS number')
        .then((result) => {
          expect(result[0].number).to.equal(2);
          done();
        })
        .catch((err) => done(err));
    });
  });
});
