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
      testConstruct.query('').catch((e) => {
        expect(e).to.be.instanceof(Error);
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
