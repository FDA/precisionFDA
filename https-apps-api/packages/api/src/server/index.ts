import http from 'http'
import https from 'https'
import fs from 'fs'
import Koa from 'koa'
import koaBody from 'koa-bodyparser'
import { config } from '@pfda/https-apps-shared'
import { log } from '../logger'
import * as mdw from './middleware'
import { router } from './routes'

const koa = new Koa<Koa.DefaultState, Api.Ctx>()
// todo: security, compression middlewares
koa.use(koaBody())
koa.use(mdw.makeLogRequestMdw())
koa.use(mdw.makeErrorHandlerMdw())
koa.use(mdw.makeOrmContextMdw())
koa.use(mdw.makeUserContextMdw())
// routes
koa.use(router.routes())
koa.use(router.allowedMethods())

// the null type here is "ignored" because in allow-strict-null-checks = false mode
// it is considered a subtype of T
// we can consider using the strict null checks option
let server: http.Server | null

const startHttpServer = async (): Promise<void> => {
  await new Promise(done => {
    const startedServer = http
      .createServer(koa.callback())
      .listen(config.api.port, done as () => void)
    server = startedServer
  })
  log.info(`HTTP Server: started (port: ${config.api.port.toString()})`)
}

const startHttpsServer = async (): Promise<void> => {
  await new Promise(done => {
    const startedServer = https
      .createServer(
        {
          // eslint-disable-next-line no-sync
          key: fs.readFileSync(config.api.keyCertPath),
          // eslint-disable-next-line no-sync
          cert: fs.readFileSync(config.api.certPath),
        },
        koa.callback(),
      )
      .listen(config.api.port, done as () => void)
    server = startedServer
  })
  log.info(`HTTPS Server: started (port: ${config.api.port.toString()})`)
}

const stopServer = async (): Promise<void> => {
  if (server?.listening) {
    await new Promise(done => server.close(done))
  }
  log.info('Server: closed')
}

export const api = {
  startHttpsServer,
  startHttpServer,
  stopServer,
  getServer: () => server,
}
