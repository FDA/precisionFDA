import { HttpService } from '@nestjs/axios'
import { Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { ClientRequestError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { firstValueFrom } from 'rxjs'
import { WebSocket } from 'ws'

const ADMIN_PLATFORM_CLIENT_URL = config.service.adminPlatformClient.url + '/execute'
const logger = new Logger('AdminPlatformClient')

const streamJobLogs = (jobDxId: string) => {
  const ws = new WebSocket(`ws://${new URL(config.service.adminPlatformClient.url).host}`)
  ws.on('open', () => {
    ws.send(JSON.stringify({ event: 'getLog', data: { jobDxId: jobDxId } }))
  })
  ws.on('error', (err) => {
    logger.error(`Error in streamJobLogs: ${err}`)
    ws.terminate()
  })
  return ws
}

export const ADMIN_PLATFORM_CLIENT = 'ADMIN_PLATFORM_CLIENT'

export const adminPlatformClientProvider = {
  provide: ADMIN_PLATFORM_CLIENT,
  useFactory: (httpService: HttpService) => {
    return new Proxy(new PlatformClient({ accessToken: 'dummy' }), {
      get(target: PlatformClient, prop: string) {
        if (typeof target[prop] !== 'function') {
          return target[prop]
        }

        if (prop === 'streamJobLogs') {
          return streamJobLogs
        }

        return async (...args: unknown[]) => {
          const stackTrace = new Error().stack
          logger.log(
            { stackTrace },
            `Calling admin platform client method. Method: "${prop}", Args: ${JSON.stringify(args)}`,
          )

          try {
            const res = await firstValueFrom(
              httpService.post(ADMIN_PLATFORM_CLIENT_URL, {
                method: prop,
                params: args,
              }),
            )

            return res.data
          } catch (error) {
            const responseData = error?.response?.data

            if (responseData?.errorType === 'ClientRequestError') {
              throw new ClientRequestError(responseData.message, {
                clientResponse: responseData.clientResponse,
                clientStatusCode: responseData.clientStatusCode,
              })
            }

            if (responseData?.message) {
              throw new Error(responseData?.message)
            }

            throw error
          }
        }
      },
    })
  },
  inject: [HttpService],
}
