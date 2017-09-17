# Modli - PostgreSQL Adapter

This module provides adapter for the [PostgreSQL](http://www.postgresql.org/)
datasource for integration with [Modli](https://github.com/node-modli).

## Installation

```
npm install modli-postgres --save
```

## Config and Usage

When defining a property which will utilize the adapter it is required that a
`tableName` be supplied:

```javascript
const { model, adapter, obey, use } = require('modli')
const postgres from require('modli-postgres')

model.add({
  name: 'foo',
  version: 1,
  tableName: 'tblFoo'
  schema: obey.model({
    id: { type: 'number' },
    fname: { type: 'string', min: 3, max: 30 },
    lname: { type: 'string', min: 3, max: 30 },
    email: { type: 'email', min: 3, max: 254, required: true }
  })
})
```

Then add the adapter as per usual with the following config object structure:

```javascript
adapter.add({
  name: 'postgresFoo',
  source: postgres
  config: {
    host: {HOST_IP},
    user: {USERNAME},
    password: {PASSWORD},
    database: {DATABASE}
  }
})
```

You can then use the adapter with a model via:

```javascript
// Use(MODEL, ADAPTER)
const postgresTest = use('foo', 'postgresFoo')
```

## Methods

The following methods exist natively on the PostgreSQL adapter:

### `query`

Allows for passing standard PostgreSQL queries:

```javascript
postgresTest.query('SELECT * FROM tblFoo')
  .then(/*...*/)
  .catch(/*...*/)
```

### `createTable`

Creates (`IF NOT EXISTS`) a table based on params:

```javascript
postgresTest.createTable({
    'id': [ 'serial', 'NOT NULL', 'PRIMARY KEY'],
    'fname': [ 'varchar(255)' ],
    'lname': [ 'varchar(255)' ],
    'email': [ 'varchar(255)' ]
  })
  .then(/*...*/)
  .catch(/*...*/)
```

### `create`

Creates a new record based on object passed:

```javascript
postgresTest.create({
    fname: 'John',
    lname: 'Smith',
    email: 'jsmith@gmail.com'
  })
  .then(/*...*/)
  .catch(/*...*/)
```

### `read`

Runs a `SELECT` with optional `WHERE`:

```javascript
postgresTest.read('fname=\'John\'')
  .then(/*...*/)
  .catch(/*...*/)
```

### `update`

Updates record(s) based on query and body:

```javascript
postgresTest.update('fname=\'John\'', {
    fname: 'Bob',
    email: 'bsmith@gmail.com'
  })
  .then(/*...*/)
  .catch(/*...*/)
```

### `delete`

Deletes record(s) based on query:

```javascript
postgresTest.delete('fname=\'Bob\'')
  .then(/*...*/)
  .catch(/*...*/)
```

### `extend`

Extends the adapter to allow for custom methods:

```javascript
postgresTest.extend('myMethod', () => {
  /*...*/
})
```

## Development

The PostgreSQL adapter requires the following environment variables to be set for
running the tests. These should be associated with the PostgreSQL instance running
locally.

```
MODLI_POSTGRES_HOST,
MODLI_POSTGRES_USERNAME,
MODLI_POSTGRES_PASSWORD,
MODLI_POSTGRES_DATABASE
```

This repository includes a base container config for running locally which is
located in the [/docker](/docker) directory.

## License

Modli-Postgres is licensed under the MIT license. Please see `LICENSE.txt` for full details.

## Credits

Modli-Postgres was designed and created at [TechnologyAdvice](http://www.technologyadvice.com).
