import Promise from 'bluebird';
import pg from 'pg';

/**
 * @class postgres
 */
export default class {
  /**
   * Creates the connection string for the instance
   * @param {Object} config
   * @property {String} config.host The host to connect to
   * @property {String} config.username The connection username
   * @property {String} config.password The connection password
   * @property {String} config.database The connection database
   */
  constructor (config) {
    this.connStr = `postgres://${config.username}:${config.password}@${config.host}/${config.database}`;
  }

  /**
   * Runs query against instance conn
   * @param {String} query The query to execute
   * @returns {Object} promise
   */
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

  /**
   * Creates a table
   * @memberof mysql
   * @param {String} name The name of the table to create
   * @param {Object} props The properties of the table
   * @returns {Object} promise
   */
  createTable (props) {
    // Build query
    const len = Object.keys(props).length;
    let i = 1;
    let query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (`;
    for (let prop in props) {
      let comma = (i !== len) ? ', ' : '';
      query += `${prop} ${props[prop].join(' ')}${comma}`;
      i++;
    }
    query += ');';
    // Run query
    return this.query(query);
  }

}
