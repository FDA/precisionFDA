// just a bunch of api calls that will be easy to mock
import axios, { AxiosRequestConfig } from 'axios'
import { isNil, omit } from 'ramda'
import type { Logger } from 'pino'
import { errors } from '..'
import { config } from '../config'
import { getLogger } from '../logger'
import type { AnyObject } from '../types'

type BaseParams = {
  accessToken: string
}
type JobDescribeParams = BaseParams & { jobId: string }
type JobTerminateParams = BaseParams & { jobId: string }
// todo: ..
type JobCreateParams = BaseParams & {
  appId: string
  project: string
  name?: string
  input: AnyObject
  systemRequirements: AnyObject
  snapshot?: {
    $dnanexus_link: {
      project?: string
      id: string
    }
  }
}

type ListFilesParams = BaseParams & {
  project: string
  folder?: string
  includeDescProps?: boolean
  // the API uses it as a starting point when doing pagination
  starting?: {
    project: string
    id: string
  }
}

type DescribeFilesParams = BaseParams & {
  fileIds: string[]
}

type DescribeFoldersParams = BaseParams & {
  projectId: string
}

type RenameFolderParams = BaseParams & {
  folderPath: string
  newName: string
  projectId: string
}

type RemoveFolderParams = BaseParams & {
  folderPath: string
  projectId: string
}

type ListFilesResponse = {
  results: Array<{
    id: string
    project: string
    describe?: {
      id: string
      name: string
      size: number
    }
  }>
  // if set up, we might want to paginate
  next?: {
    project: string
    id: string
  }
}

type DescribeFilesResponse = {
  results: Array<{
    describe: {
      id: string
      name: string
      size: number
      // add more here
    }
  }>
}

type DescribeFoldersResponse = {
  id: string
  folders: string[]
}

type JobCreateResponse = {
  id: string
}

type JobTerminateResponse = JobCreateResponse

type ClassIdResponse = {
  id: string
}

// just basic types we are interested in at the moment
type JobDescribeResponse = {
  state: string
  project: string
  billTo: string
  httpsApp: {
    ports: number[]
    shared_access: string
    enabled: boolean
    dns: {
      url?: string
    }
  }
} & AnyObject

const defaultLog = getLogger('platform-client-logger')

class PlatformClient {
  log: Logger
  constructor(logger?: Logger) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.log = logger ?? defaultLog
  }

  async jobCreate(params: JobCreateParams): Promise<JobCreateResponse> {
    const url = `${config.platform.apiUrl}/${params.appId}/run`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['accessToken', 'appId'], params) },
      url,
      headers: this.setupHeaders(params),
    }
    try {
      this.log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.log.warn({ requestOptions: options }, 'Failed request options')
      return this.handleFailed(err)
    }
  }

  async jobTerminate(params: JobTerminateParams): Promise<JobTerminateResponse> {
    const url = `${config.platform.apiUrl}/${params.jobId}/terminate`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
      headers: this.setupHeaders(params),
    }
    try {
      this.log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.log.warn({ requestOptions: options }, 'Failed request options')
      return this.handleFailed(err)
    }
  }

  async renameFolder(params: RenameFolderParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.projectId}/renameFolder`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        folder: params.folderPath,
        name: params.newName,
      },
      url,
      headers: this.setupHeaders(params),
    }
    try {
      this.log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.log.warn({ requestOptions: options }, 'Failed request options')
      return this.handleFailed(err)
    }
  }

  async removeFolderRec(params: RemoveFolderParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.projectId}/removeFolder`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        folder: params.folderPath,
        recurse: true,
      },
      url,
      headers: this.setupHeaders(params),
    }
    try {
      this.log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.log.warn({ requestOptions: options }, 'Failed request options')
      return this.handleFailed(err)
    }
  }

  async jobDescribe(params: JobDescribeParams): Promise<JobDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.jobId}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
      headers: this.setupHeaders(params),
    }
    try {
      this.log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.log.warn({ requestOptions: options }, 'Failed request options')
      return this.handleFailed(err)
    }
  }

  async filesListPaginated(params: ListFilesParams): Promise<ListFilesResponse> {
    let nextMapping: ListFilesParams['starting']
    const results: ListFilesResponse['results'] = []
    // use reduce?
    const paginateSeq = async (): Promise<void> => {
      do {
        // eslint-disable-next-line no-await-in-loop
        const res = await this.filesList({ ...params, starting: nextMapping })
        if (!isNil(res.next)) {
          // eslint-disable-next-line require-atomic-updates
          nextMapping = { id: res.next.id, project: res.next.project }
        } else {
          // eslint-disable-next-line require-atomic-updates
          nextMapping = undefined
        }
        results.push(...res.results)
      } while (!isNil(nextMapping))
    }
    await paginateSeq()
    return { results }
  }

  async foldersList(params: DescribeFoldersParams): Promise<DescribeFoldersResponse> {
    const url = `${config.platform.apiUrl}/${params.projectId}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { fields: { folders: true } },
      url,
      headers: this.setupHeaders(params),
    }
    try {
      this.log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.log.warn({ requestOptions: options }, 'Failed request options')
      return this.handleFailed(err)
    }
  }

  private async filesList(params: ListFilesParams): Promise<ListFilesResponse> {
    const data: AnyObject = {
      class: 'file',
      limit: config.platform.findDataObjectsQueryLimit,
      starting: params.starting,
    }
    const scope = {
      project: params.project,
      folder: params.folder ?? '/',
      recurse: false,
    }
    data.scope = scope
    if (!isNil(params.includeDescProps)) {
      data.describe = {
        fields: {
          name: true,
          size: true,
        },
      }
    }
    const url = `${config.platform.apiUrl}/system/findDataObjects`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data,
      url,
      headers: this.setupHeaders(params),
    }
    try {
      this.log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.log.warn({ requestOptions: options }, 'Failed request options')
      return this.handleFailed(err)
    }
  }

  private setupHeaders(params: BaseParams): AnyObject {
    return { authorization: `Bearer ${params.accessToken}` }
  }

  private handleFailed(err: any): any {
    // response status code is NOT 2xx
    if (err.response) {
      this.log.error(
        {
          response: err.response.data,
          statusCode: err.response.status,
          resHeaders: err.response.headers,
        },
        'Failed platform response',
      )
      throw new errors.ClientRequestError('DNANexus client API call failed', {
        clientResponse: err.response.data,
        clientStatusCode: err.response.status,
      })
    } else if (err.request) {
      // the request was made but no response was received
      this.log.error({ err }, 'Failed platform request - no response received')
    } else {
      this.log.error({ err }, 'Failed platform request - different error')
    }
    // todo: handle this does not result in 500 API error
    throw err
  }
}

export {
  PlatformClient,
  JobDescribeResponse,
  JobCreateResponse,
  ListFilesResponse,
  ClassIdResponse,
  DescribeFilesResponse,
  JobCreateParams,
  DescribeFoldersResponse,
}
