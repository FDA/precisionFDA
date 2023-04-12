import { Logger } from 'pino'
import axios, { AxiosInstance } from 'axios'
import * as errors from '../../errors'
import { UserCtx } from '../../types'
import { PlatformClient, IPlatformAuthClient } from '../../platform-client'
import { getServiceFactory } from '../../services/service-factory'


interface IUserService {
  newAuthToken(redirectUri: string): Promise<string>
}

class UserService implements IUserService {
  private readonly log: Logger
  private readonly ctx: UserCtx
  private readonly axiosInstance: AxiosInstance
  private readonly client: PlatformClient
  readonly authClient: IPlatformAuthClient

  constructor(userCtx: UserCtx, log: Logger, axiosInstance?: AxiosInstance) {
    this.ctx = userCtx
    this.log = log
    this.axiosInstance = axiosInstance ?? axios.create()
    this.authClient = getServiceFactory().getPlatformAuthClient(userCtx.accessToken, log, this.axiosInstance)
  }

  async newAuthToken(redirectUri: string): Promise<string> {
    this.log.info({
      id: this.ctx.id,
      dxuser: this.ctx.dxuser,
      redirectUri,
    }, 'UserService: Requesting user auth token')

    const response = await this.authClient.newAuthToken(redirectUri)
    this.log.info(`newAuthToken response: ${response.authorization_code}`)
    return response.authorization_code
  }

  // TODO - Refactor calls like ResetMFA here
}

export {
  IUserService,
  UserService,
}
