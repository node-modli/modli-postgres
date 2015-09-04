[![wercker status](https://app.wercker.com/status/74461495df913d3524f2a11c9db4cd9b/s/master "wercker status")](https://app.wercker.com/project/bykey/74461495df913d3524f2a11c9db4cd9b)
[![Code Climate](https://codeclimate.com/github/node-modli/modli-postgres/badges/gpa.svg)](https://codeclimate.com/github/node-modli/modli-postgres)
[![Test Coverage](https://codeclimate.com/github/node-modli/modli-postgres/badges/coverage.svg)](https://codeclimate.com/github/node-modli/modli-postgres/coverage)

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
import { model, adapter, Joi, use } from 'modli';
import postgres from 'modli-postgres';

model.add({
  name: 'foo',
  version: 1,
  tableName: 'tblFoo'
  schema: {
    id: Joi.number().integer(),
    fname: Joi.string().min(3).max(30),
    lname: Joi.string().min(3).max(30),
    email: Joi.string().email().min(3).max(254).required()
  }
});
```

Then add the adapter as per usual with the following config object structure:

```javascript
adapter.add({
  name: 'postgresFoo',
  source: postgres
  config: {
    host: {HOST_IP},
    username: {USERNAME},
    password: {PASSWORD},
    database: {DATABASE}
  }
});
```

You can then use the adapter with a model via:

```javascript
// Use(MODEL, ADAPTER)
const postgresTest = use('foo', 'postgresFoo');
```

## Methods

The following methods exist natively on the PostgreSQL adapter:

### `query`

Allows for passing standard PostgreSQL queries:

```javascript
postgresTest.query('SELECT * FROM tblFoo')
  .then(/*...*/)
  .catch(/*...*/);
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
  .catch(/*...*/);
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
  .catch(/*...*/);
```

### `read`

Runs a `SELECT` with optional `WHERE`:

```javascript
postgresTest.read('fname=\'John\'')
  .then(/*...*/)
  .catch(/*...*/);
```

### `update`

Updates record(s) based on query and body:

```javascript
postgresTest.update('fname=\'John\'', {
    fname: 'Bob',
    email: 'bsmith@gmail.com'
  })
  .then(/*...*/)
  .catch(/*...*/);
```

### `delete`

Deletes record(s) based on query:

```javascript
postgresTest.delete('fname=\'Bob\'')
  .then(/*...*/)
  .catch(/*...*/);
```

### `extend`

Extends the adapter to allow for custom methods:

```javascript
postgresTest.extend('myMethod', () => {
  /*...*/
});
```

## Development

The PostgreSQL adapter requires the following enviroment variables to be set for
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

## Makefile and Scripts

A `Makefile` is included for managing build and install tasks. The commands are
then referenced in the `package.json` `scripts` if that is the preferred
task method:

* `all` (default) will run all build tasks
* `start` will run the main script
* `clean` will remove the `/node_modules` directories
* `build` will transpile ES2015 code in `/src` to `/build`
* `test` will run all spec files in `/test/src`
* `test-cover` will run code coverage on all tests
* `lint` will lint all files in `/src`

## Testing

Running `make test` will run the full test suite. Since adapters require a data
source if one is not configured the tests will fail. To counter this tests are
able to be broken up.

**Test Inidividual File**

An individual spec can be run by specifying the `FILE`. This is convenient when
working on an individual adapter.

```
make test FILE=some.spec.js
```

The `FILE` is relative to the `test/src/` directory.

**Deploys**

For deploying releases, the `deploy TAG={VERSION}` can be used where `VERSION` can be:

```
<newversion> | major | minor | patch | premajor
```

Both `make {COMMAND}` and `npm run {COMMAND}` work for any of the above commands.

## License

Modli-Postgres is licensed under the MIT license. Please see `LICENSE.txt` for full details.

## Credits

Modli-Postgres was designed and created at [TechnologyAdvice](http://www.technologyadvice.com).