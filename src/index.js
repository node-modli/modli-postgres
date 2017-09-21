const { Pool } = require('pg')

/**
 * @class postgres
 */
module.exports = class {
  /**
   * Creates the connection string for the instance
   * @param {Object} config
   * @param {String} config.host The host to connect to
   * @param {String} config.user The connection username
   * @param {String} config.password The connection password
   * @param {String} config.database The connection database
   */
  constructor (config) {
    this.pg = new Pool(config)
  }

  /**
   * Runs query against instance conn
   * @param {String} query The query to execute
   * @returns {Object} promise
   */
  query (query) {
    let client
    return this.pg.connect()
      .then((cli) => {
        client = cli
        return client.query(query)
      })
      .then(res => {
        client.release()
        return res
      })
      .catch((err) => {
        client.release()
        throw err
      })
  }

  /**
   * Creates a table
   * @param {String} name The name of the table to create
   * @param {Object} props The properties of the table
   * @returns {Object} promise
   */
  createTable (props) {
    // Build query
    const len = Object.keys(props).length
    let i = 1
    let query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (`
    for (let prop in props) {
      let comma = (i !== len) ? ', ' : ''
      query += `${prop} ${props[prop].join(' ')}${comma}`
      i++
    }
    query += ')'
    // Run query
    return this.query(query)
  }

  /**
   * Creates a new record
   * @param {Object} body The record to insert
   * @param {Sting|Number} [version] The version of the model
   * @returns {Object} promise
   */
  create (body, version = false) {
    return this.validate(body)
      .then(data => {
        const vals = []
        const cols = Object.keys(data).reduce((acc, key) => {
          vals.push(`'${data[key]}'`)
          acc.push(key)
          return acc
        }, [])
        const query = `INSERT INTO ${this.tableName} (${cols.join(',')}) VALUES (${vals.join(',')})`
        return this.query(query)
          .then(res => {
            if (res.rowCount) return data
            throw new Error('Unable to create record')
          })
      })
  }

  /**
   * Queries for a record
   * @param {Object} query The query to execute
   * @returns {Object} promise
   */
  read (query, version = false) {
    const where = query ? ` WHERE ${query}` : ''
    return this.query(`SELECT * FROM ${this.tableName}${where}`)
      .then((results) => {
        return results.rows.map((r) => {
          return this.sanitize ? this.sanitize(r, version) : r
        })
      })
  }

  /**
   * Updates an existing record
   * @param {Object} query The query to identify update record(s)
   * @params {Object} body The record contents to update
   * @params {String|Number} version The version of the model
   * @returns {Object} promise
   */
  update (query, body, version = false) {
    return this.validate(body)
      .then(data => {
        let i = 1
        let changes = ''
        let len = Object.keys(data).length
        for (let prop in data) {
          if ({}.hasOwnProperty.call(data, prop)) {
            let comma = (i !== len) ? ', ' : ''
            changes += `${prop}='${data[prop]}'${comma}`
            i++
          }
        }
        return this.query(`UPDATE ${this.tableName} SET ${changes} WHERE ${query}`)
      })
  }

  /**
   * Deletes a record
   * @param {Object} query
   * @returns {Object} promise
   */
  delete (query) {
    return this.query(`DELETE FROM ${this.tableName} WHERE ${query}`)
  }

  /**
   * Extends the postgres object
   * @param {String} name The name of the method
   * @param {Function} fn The function to extend on the object
   */
  extend (name, fn) {
    this[name] = fn.bind(this)
  }
}
