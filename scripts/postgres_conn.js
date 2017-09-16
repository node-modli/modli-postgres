const net = require('net')
const host = process.env.MODLI_POSTGRES_HOST
const port = 5432
const retries = 150
let retryCount = 0

process.stdout.write(`Awaiting Connection to ${host}`)

const testConn = () => {
  const conn = net.createConnection(port, host)
  conn.on('connect', () => {
    process.stdout.write(`OK\n\n`)
    process.exit(0)
  })
  conn.on('error', () => {
    retryCount++
    if (retryCount >= retries) {
      process.stdout.write('FAILED\n\n')
      process.exit(1)
    }
    process.stdout.write('.')
    setTimeout(testConn, 150)
  })
}

testConn()
