import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { CookieJar } from 'tough-cookie'

export interface AxiosCookieJarConfig extends AxiosRequestConfig {
  jar: CookieJar
  withCredentials: boolean
}

export type AxiosResponseWithJar = AxiosResponse & {
  config: AxiosCookieJarConfig
}
