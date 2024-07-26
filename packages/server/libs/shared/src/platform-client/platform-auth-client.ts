/* eslint-disable max-len */
import { MfaAlreadyResetError } from '@shared/errors'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { Logger } from '@nestjs/common'
import { config } from '../config'
import { getLogger } from '../logger'
import { PlatformClientBase } from './platform-client-base'


const defaultLog = getLogger('platform-auth-client-logger')


// Putting the Params/Responses here for now
type NewAuthTokenResponse = {
  authorization_code: string
}

type UserResetMfaParams = {
  dxid: string
  data: {
    user_id: string
    org_id: string
  }
}


interface IPlatformAuthClient {
  newAuthToken(redirectUri: string): Promise<NewAuthTokenResponse>
  userResetMfa(params: UserResetMfaParams): Promise<any>
}


// Client for communicating with Platform's auth server
//
class PlatformAuthClient extends PlatformClientBase implements IPlatformAuthClient {
  private readonly baseUrl: string
  private readonly accessToken: string
  readonly axiosInstance: AxiosInstance

  constructor(accessToken: string, logger?: Logger, axiosInstance?: AxiosInstance) {
    super()
    this.baseUrl = config.platform.authApiUrl
    this.accessToken = accessToken
    this.axiosInstance = axiosInstance || axios.create()
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.logger = logger ?? defaultLog
  }

  // ---------------
  //    U S E R S
  // ---------------

  /**
   * Generate an authentication key for use in CLI
   */
  async newAuthToken(redirectUri: string): Promise<NewAuthTokenResponse> {
    const params = {
      grant_type: 'authorization_code',
      scope: { full: true },
      label: 'httpsapp',
      client_id: 'httpsapp',
      redirect_uri: redirectUri,
    }

    const url = `${this.baseUrl}/system/newAuthToken`
    const headers = this.setupHeaders(this.accessToken)
    // By default the user-agent is axios and there may be special code in platform
    // to apply special priviledges to Ruby
    headers['user-agent'] = 'Ruby'
    // Vishal's tests revealed that Referer header is needed for successful code generation
    // but our Ruby code doesn't have this and that works
    // headers.Referer = redirectUri
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: params,
      url,
      headers,
    }

    this.logger.log({ options }, 'Sending newAuthToken request')
    const res = await this.axiosInstance.request(options)
    this.logger.log({
      headers: res.headers,
      config: res.config,
      data: res.data,
    }, 'Received newAuthToken response')
    return res.data
  }

  /**
   * Reset a user's MFA
   */
  async userResetMfa(params: UserResetMfaParams): Promise<any> {
    const url = `${config.platform.authApiUrl}/${params.dxid}/resetUserMFA`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: params.data,
      url,
      headers: this.setupHeaders(this.accessToken),
    }

    try {
      this.logClientRequest(options, url)
      const res = await this.axiosInstance.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err, (_, __, message) => {
        if (message.includes('MFA is already reset')) {
          throw new MfaAlreadyResetError()
        }
      })
    }
  }
}

export {
  IPlatformAuthClient,
  PlatformAuthClient,
}
