import Promise from 'bluebird';
import pg from 'pg';

/**
 * @class postgres
 */
export default class {

  constructor (config) {
    this.connStr = `postgres://${config.username}:${config.password}@${config.host}/${config.database}`;
  }

  query (query) {
    return new Promise((resolve, reject) => {
      pg.connect(this.connStr, (err, client, done) => {
        if (err) {
          reject(err);
        } else {
          client.query(query, (e, result) => {
            // Release client
            done();
            // Process
            if (e) {
              reject(e);
            } else {
              resolve(result.rows);
            }
          });
        }
      });
    });
  }

}
