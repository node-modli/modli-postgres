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
              resolve(result);
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

  /**
   * Creates a new record
   * @param {Object} body The record to insert
   * @param {Sting|Number} [version] The version of the model
   * @returns {Object} promise
   */
  create (body, version = false) {
    return new Promise((resolve, reject) => {
      // Validate
      const validationErrors = this.validate(body, version);
      if (validationErrors) {
        reject(validationErrors);
      } else {
        // Build query
        let cols = [];
        let vals = [];
        for (let prop in body) {
          cols.push(prop);
          vals.push('\'' + body[prop] + '\'');
        }
        const query = `INSERT INTO ${this.tableName} (${cols.join(',')}) VALUES (${vals.join(',')});`;
        // Run query
        resolve(this.query(query));
      }
    });
  }

  /**
   * Queries for a record
   * @param {Object} query The query to execute
   * @returns {Object} promise
   */
  read (query, version = false) {
    let where;
    if (query) {
      where = ` WHERE ${query}`;
    } else {
      where = '';
    }
    return new Promise((resolve, reject) => {
      return this.query(`SELECT * FROM ${this.tableName}${where}`)
        .then((results) => {
          let tmp = [];
          results.rows.forEach((r) => {
            tmp.push(this.sanitize(r, version));
          });
          resolve(tmp);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Updates an existing record
   * @param {Object} query The query to identify update record(s)
   * @params {Object} body The record contents to update
   * @params {String|Number} version The version of the model
   * @returns {Object} promise
   */
  update (query, body, version = false) {
    return new Promise((resolve, reject) => {
      const validationErrors = this.validate(body, version);
      if (validationErrors) {
        reject(validationErrors);
      } else {
        let i = 1;
        let changes = '';
        let len = Object.keys(body).length;
        for (let prop in body) {
          if ({}.hasOwnProperty.call(body, prop)) {
            let comma = (i !== len) ? ', ' : '';
            changes += `${prop}='${body[prop]}'${comma}`;
            i++;
          }
        }
        resolve(this.query(`UPDATE ${this.tableName} SET ${changes} WHERE ${query}`));
      }
    });
  }

  /**
   * Deletes a record
   * @param {Object} query
   * @returns {Object} promise
   */
  delete (query) {
    return this.query(`DELETE FROM ${this.tableName} WHERE ${query}`);
  }

  /**
   * Extends the mysql object
   * @param {String} name The name of the method
   * @param {Function} fn The function to extend on the object
   */
  extend (name, fn) {
    this[name] = fn.bind(this);
  }

}
