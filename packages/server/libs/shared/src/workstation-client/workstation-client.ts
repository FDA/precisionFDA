/* eslint-disable max-len */
import { ClientRequestError, IncompatibleVersionError, InternalError } from '@shared/errors'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { compareVersions } from 'compare-versions'
import type { Logger } from '@nestjs/common'
import { CookieJar } from 'tough-cookie'
import { maskAuthHeader } from '../utils/logging'
import { getLogger } from '../logger'

export type SnapshotParams = {
  name?: string
  terminate: boolean
}

export type CLIConfigParams = {
  Key: string
  Server?: string
  Scope?: string
}

interface IWorkstationClient {
  apiVersion: string
  oauthAccess(authToken: string): Promise<void>
  alive(): Promise<boolean>
  snapshot(params: SnapshotParams): Promise<any>
  setAPIKey(key: string): Promise<void>
  setPFDAConfig(params: CLIConfigParams): Promise<void>
}


const defaultLog = getLogger('workstation-client-logger')

const API_PORT = '8081'
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'


// WorkstationClient encapsulates communications with the workstation API
// including managing oauth access tokens and setting the necessary headers
// to communicate with the workstation
//
// A design choice here is to keep this class as isolated as possible from other precisionFDA code
// as we may want to package it to be used by scripts or other clients
//
class WorkstationClient implements IWorkstationClient {
  private readonly logger: Logger
  // Axios instance must be passed in, to inherit the same session and cookies from PlatformAuthClient
  private readonly axiosInstance: AxiosInstance
  // base URI to the workstation API service
  private readonly baseUrl: string
  // hostname of the workstation derived from job describe
  private readonly host: string
  private readonly workstationUrl: string
  // apiVersion if undefined is assumed to be the latest
  public apiVersion: string

  cookie: string

  constructor(url: string, axiosInstance?: AxiosInstance, logger?: Logger) {
    this.axiosInstance = axiosInstance ?? axios.create()
    this.workstationUrl = url
    this.host = new URL(url).host
    this.baseUrl = `https://${this.host}:${API_PORT}/api`
    this.logger = logger ?? defaultLog
  }

  // OAuth access to the workstation
  // This requires an authToken that's obtained by calling
  // auth server's /system/newAuthToken endpoint
  async oauthAccess(authToken: string): Promise<void> {
    // First get the Referer url
    const jobResponse = await this.axiosInstance.get(this.workstationUrl)
    const refrerUrl = jobResponse.config.url
    this.logger.log(`Obtained refrerUrl ${refrerUrl}`)

    const url = `${this.workstationUrl}/oauth2/access?code=${authToken}`
    this.logger.log(`Oauth calling url ${url}`)

    const options: AxiosRequestConfig = {
      method: 'GET',
      headers: {
        // Must use the correct user agent
        'User-Agent': USER_AGENT,
        Referer: refrerUrl,
      },
      url,
    }

    try {
      const response = await this.sendRequest(options, true)
      const cookie = await this.extractWorkstationCookie(response)
      if (!cookie) {
        throw new InternalError('Unable to obtain workstation cookie')
      }
      this.cookie = cookie

      // Should not print cookie to logs, the following is for debugging
      // this.log.verbose(`WorkstationClient got cookie: ${this.cookie}`)

      this.logger.log({
        workstationUrl: this.workstationUrl,
        host: this.host,
        baseUrl: this.baseUrl,
      },'WorkstationClient oauth success')
      return response
    } catch (error) {
      this.logger.error(`Oauth request error: ${error}`)
      throw error
    }
  }

  private async extractWorkstationCookie(response: any): Promise<string | null> {
    const jar = response.config.jar as CookieJar
    this.logger.log({ jar }, 'extractWorkstationCookie jar')

    const cookies = await jar.getCookies(this.workstationUrl)
    this.logger.log({ cookies }, 'extractWorkstationCookie cookies')
    for (const cookie of cookies) {
      if (cookie.key.startsWith('job-')) {
        return `${cookie.key}=${cookie.value}`
      }
    }
    return null
  }

  private validateCookie() {
    if (this.cookie === undefined) {
      throw new InternalError('Workstation cookie is not present. Check for oauth failure')
    }
  }

  /**
   * Alive check for workstation API
   */
  async alive(): Promise<boolean> {
    this.validateCookie()

    const url = `${this.baseUrl}/alive`
    const options: AxiosRequestConfig = {
      method: 'GET',
      headers: this.setupHeaders(),
      url,
    }
    try {
      return await this.sendRequest(options)
    } catch {
      return false
    }
  }

  /**
   * Create a workstation snapshot
   *
   * Available on workstation_api v1.0 or above
   */
  async snapshot(params: SnapshotParams): Promise<any> {
    this.validateCookie()

    const url = `${this.baseUrl}/snapshot`
    const options: AxiosRequestConfig = {
      method: 'POST',
      headers: this.setupHeaders(),
      data: params,
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Set the pFDA CLI key
   *
   * Available on workstation_api v1.0 or above
   */
  async setAPIKey(key: string): Promise<void> {
    this.validateCookie()

    const url = `${this.baseUrl}/setPFDAKey`
    const options: AxiosRequestConfig = {
      method: 'POST',
      headers: this.setupHeaders(),
      data: { Key: key },
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Set the pFDA Config
   *
   * Available on workstation_api v1.1 or above
   */
  async setPFDAConfig(params: CLIConfigParams): Promise<void> {
    if (this.apiVersion && compareVersions(this.apiVersion, '1.1') < 0) {
      const message = `Cannot use /api/setPFDAConfig because job's api version (${this.apiVersion}) is less than 1.1`
      this.logger.error(message)
      throw new IncompatibleVersionError(message)
    }

    this.validateCookie()

    const url = `${this.baseUrl}/setPFDAConfig`
    const options: AxiosRequestConfig = {
      method: 'POST',
      headers: this.setupHeaders(),
      data: JSON.stringify(params),
      url,
    }
    return await this.sendRequest(options)
  }

  protected async sendRequest(options: AxiosRequestConfig, returnFullResponse?: boolean) {
    returnFullResponse = returnFullResponse ?? false
    try {
      this.logClientRequest(options)
      const res = await this.axiosInstance.request(options)
      this.logger.log({ data: res.data }, 'SendRequest response')
      return returnFullResponse ? res : res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err)
    }
  }

  protected setupHeaders() {
    // For requests to work, the following headers must be present and correct. e.g.
    // 'Cookie': 'job-GP59k0Q00xb0bvXG20gJG4BK=4ZvJE-zH etc etc'
    // 'Host': 'job-gp59k0q00xb0bvxg20gjg4bk.internal.dnanexus.cloud'
    // 'User-Agent': '<Suitable browser user agent>'
    return {
      Cookie: this.cookie,
      Host: `${this.host}:${API_PORT}`,
      // Referer: this.workstationUrl,
      'User-Agent': USER_AGENT,
    }
  }

  protected maskRequestData(data: any): void {
    return (data && data.Key) ? {...data, 'Key': '[masked]'} : data
  }

  protected logClientRequest(options: AxiosRequestConfig): void {
    const sanitized = maskAuthHeader(options.headers)
    const data = this.maskRequestData(options.data)
    this.logger.log(
      {
        requestOptions: { ...options, headers: sanitized, data },
        url: options.url,
      },
      'Running Workstation request',
    )
  }

  protected logClientFailed(options: AxiosRequestConfig): void {
    const sanitized = maskAuthHeader(options.headers)
    const data = this.maskRequestData(options.data)
    this.logger.warn(
      {
        requestOptions: { ...options, headers: sanitized, data },
        url: options.url,
      },
      'Request failed',
    )
  }

  protected handleFailed(
    err: any,
    customErrorThrower?: (statusCode: number, errorType: string, errorMessage: string) => void,
  ): any {
    if (err.response) {
      const statusCode = err.response.status
      const errorType = err.response.data?.error?.type || 'Server Error'
      const errorMessage = err.response.data?.error?.message || err.response.data
      if (customErrorThrower) {
        customErrorThrower(statusCode, errorType, errorMessage)
      }
      throw new ClientRequestError(
        `${errorType} (${statusCode}): ${errorMessage}`,
        {
          clientResponse: err.response.data,
          clientStatusCode: statusCode,
        },
      )
    } else if (err.request) {
      // the request was made but no response was received
      this.logger.error({ err }, 'Failed workstation request - no response received')
    } else {
      this.logger.error({ err }, 'Failed workstation request - unhandled error')
    }
  }
}

export {
  IWorkstationClient,
  WorkstationClient,
}
