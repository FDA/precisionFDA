import axios, { AxiosInstance } from 'axios'
import { UserOpsCtx } from '../../types'
import { IPlatformAuthClient } from '../../platform-client'
import { getServiceFactory } from '../../services/service-factory'
import { getLogger } from '../../logger'
import { entities } from '../index'

const logger = getLogger('user.service')

interface IUserService {
  newAuthToken(redirectUri: string): Promise<string>
  listActiveUserNames: () => Promise<string[]>
  listGovernmentUserNames: () => Promise<string[]>
}

class UserService implements IUserService {
  private readonly ctx: UserOpsCtx
  private readonly axiosInstance: AxiosInstance
  readonly authClient: IPlatformAuthClient

  constructor(ctx: UserOpsCtx, axiosInstance?: AxiosInstance) {
    this.ctx = ctx
    this.axiosInstance = axiosInstance ?? axios.create()
    this.authClient = getServiceFactory().getPlatformAuthClient(ctx.user.accessToken, logger, this.axiosInstance)
  }

  async newAuthToken(redirectUri: string): Promise<string> {
    logger.verbose({
      id: this.ctx.user.id,
      dxuser: this.ctx.user.dxuser,
      redirectUri,
    }, 'UserService: Requesting user auth token')

    const response = await this.authClient.newAuthToken(redirectUri)
    logger.verbose(`newAuthToken response: ${response.authorization_code}`)
    return response.authorization_code
  }

  async listActiveUserNames(): Promise<string[]> {
    logger.verbose('UserService: getting list of active user names')
    const result = await this.ctx.em.find(entities.User, { userState: 0})
    return result.map(user => user.dxuser)
  }

  async listGovernmentUserNames(): Promise<string[]> {
    logger.verbose('UserService: getting list of government user names')
    const result = await this.ctx.em.find(entities.User, {$and: [{userState: 0}, {email: {$like: '%fda.hhs.gov'}}]})
    return result.map(user => user.dxuser)
  }

  // TODO - Refactor calls like ResetMFA here
}

export {
  IUserService,
  UserService,
}
