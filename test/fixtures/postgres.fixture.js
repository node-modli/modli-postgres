fixd.postgres = {
  config: {
    host: process.env.MODLI_POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
  },
  testData: {
    fname: 'John',
    lname: 'Smith',
    email: 'jsmith@gmail.com',
    age: 30,
    address: {
      street: '123 Fake St',
      city: 'Nashville'
    }
  },
  createTable: {
    id: [ 'serial', 'NOT NULL', 'PRIMARY KEY' ],
    fname: [ 'varchar(255)' ],
    lname: [ 'varchar(255)' ],
    email: [ 'varchar(255)' ],
    age: [ 'integer' ],
    address: [ 'jsonb' ]
  }
}
