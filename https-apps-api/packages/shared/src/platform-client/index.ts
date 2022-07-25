// just a bunch of api calls that will be easy to mock
import axios, { AxiosRequestConfig } from 'axios'
import { isNil, omit } from 'ramda'
import type { Logger } from 'pino'
import { errors } from '..'
import { config } from '../config'
import { getLogger } from '../logger'
import type { AnyObject } from '../types'
import { maskAuthHeader } from '../utils/logging'
import { FILE_STATE_DX } from '../domain/user-file/user-file.enum'

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
  timeoutPolicyByExecutable: AnyObject
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

type CreateFolderParams = BaseParams & {
  folderPath: string
  projectId: string
}

type MoveFilesParams = BaseParams & {
  destinationFolderPath: string
  fileIds: string[]
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
      state: FILE_STATE_DX
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
  failureCount?: any
  failureReason?: string
  failureMessage?: string
} & AnyObject

type DbClusterActionParams = BaseParams & { dxid: string }
type DbClusterAction = 'start' | 'stop' | 'terminate'

type DbClusterCreateParams = BaseParams & {
  name: string
  project: string
  engine: string
  engineVersion: string
  dxInstanceClass: string
  adminPassword: string
}

type DbClusterDescribeParams = BaseParams & {
  dxid: string
  project?: string
}

type DbClusterDescribeResponse = {
  id: string
  project: string
  name: string
  created: number
  modified: number
  createdBy: { user: string }
  dxInstanceClass: string
  engine: string
  engineVersion: string
  status: string
  endpoint?: string
  port?: number
  statusAsOf?: number
  failureReason?: string
} & AnyObject

export enum PlatformErrors {
  ResourceNotFound = 'ResourceNotFound',
  PermissionDenied = 'PermissionDenied',
  InvalidInput = 'InvalidInput',
}

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
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
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
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
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
      this.logClientFailed(options)
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
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
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
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
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
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err)
    }
  }

  async folderCreate(params: CreateFolderParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.projectId}/newFolder`
    const data: AnyObject = {
      folder: params.folderPath,
      parents: true,
    }
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
      this.logClientFailed(options)
      return this.handleFailed(err)
    }
  }

  async filesMoveToFolder(params: MoveFilesParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.projectId}/move`
    // todo: keep in mind max. amounts of files
    const data: AnyObject = {
      objects: params.fileIds,
      destination: params.destinationFolderPath,
    }
    const options: AxiosRequestConfig = {
      method: 'POST',
      data,
      url,
      headers: this.setupHeaders(params),
    }
    try {
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err)
    }
  }

  async dbClusterAction(params: DbClusterActionParams,
                        action: DbClusterAction): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.dxid}/${action}`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
      headers: this.setupHeaders(params),
    }

    try {
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err)
    }
  }

  async dbClusterCreate(params: DbClusterCreateParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/dbcluster/new`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['accessToken'], params) },
      url,
      headers: this.setupHeaders(params),
    }

    try {
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err)
    }
  }

  async dbClusterDescribe(params: DbClusterDescribeParams): Promise<DbClusterDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.dxid}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['accessToken', 'dxid'], params) },
      url,
      headers: this.setupHeaders(params),
    }

    try {
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
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
          state: true,
        },
      }
    }
    // Documentation for platform API /system/findDataObjects
    // https://documentation.dnanexus.com/developer/api/search#api-method-system-finddataobjects
    const url = `${config.platform.apiUrl}/system/findDataObjects`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data,
      url,
      headers: this.setupHeaders(params),
    }
    try {
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err)
    }
  }

  private logClientRequest(options: AxiosRequestConfig, url: string): void {
    const sanitized = maskAuthHeader(options.headers)
    this.log.info(
      { requestOptions: { ...options, headers: sanitized }, url },
      'Running DNANexus API request',
    )
  }

  private logClientFailed(options: AxiosRequestConfig): void {
    const sanitized = {}
    this.log.warn({ requestOptions: { ...options, headers: sanitized } }, 'Error: Failed request options')
  }

  private setupHeaders(params: BaseParams): AnyObject {
    return { authorization: `Bearer ${params.accessToken}` }
  }

  handleFailed(err: any): any {
    // response status code is NOT 2xx
    if (err.response) {
      this.log.error(
        {
          response: err.response.data,
          statusCode: err.response.status,
          resHeaders: err.response.headers,
        },
        'Error: Failed platform response',
      )

      // Error response from the platform has the following response data:
      //   "error": {
      //     "type": "PermissionDenied",
      //     "message": "BillTo for this job's project must have the \"httpsApp\" feature enabled to run this executable"
      //   }
      //
      // Howvever, there's also a class of error response where the response payload is HTML
      // See platform-client.mock.ts for more examples
      //
      const statusCode = err.response.status
      const errorType = err.response.data?.error?.type || 'Server Error'
      const errorMessage = err.response.data?.error?.message || err.response.data
      throw new errors.ClientRequestError(
        `${errorType} (${statusCode}): ${errorMessage}`,
        {
          clientResponse: err.response.data,
          clientStatusCode: statusCode,
        },
      )
    } else if (err.request) {
      // the request was made but no response was received
      this.log.error({ err }, 'Error: Failed platform request - no response received')
    } else {
      this.log.error({ err }, 'Error: Failed platform request - different error')
    }
    // todo: handle this does not result in 500 API error
    // TODO(2): Need to consider other error types and handle them with a descriptive message
    // e.g. See ETIMEOUT error in platform-client.mock.ts
    const errorMessage = err.stack || err.message || 'Unknown error - no platform response received'
    throw new errors.ClientRequestError(
      errorMessage,
      {
        clientResponse: err.response?.data || 'No platform response',
        clientStatusCode: err.response?.status || 408,
      },
    )
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
  DbClusterCreateParams,
  DbClusterDescribeResponse,
}
