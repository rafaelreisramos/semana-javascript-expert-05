import https from 'https'
import fs from 'fs'
import { logger } from './logger.js'
import Routes from './routes.js'

const PORT = process.env.PORT || 3000

const localHostSSL = {
  key: fs.readFileSync('./certificates/key.pem'),
  cert: fs.readFileSync('./certificates/cert.pem')
}

const routes = new Routes()

const server = https.createServer(
  localHostSSL,
  routes.handler.bind(routes)
)

const startServer = () => {
  const { address, port } = server.address()
  logger.info(`api running at https://${address}:${port}`)
}

server.listen(PORT, startServer)