// just a bunch of api calls that will be easy to mock
import axios, { AxiosRequestConfig } from 'axios'
import { isNil, omit, splitEvery } from 'ramda'
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
  folders: Array<string>
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

const log = getLogger('platform-client-logger')

const setupHeaders = (params: BaseParams): any => ({
  authorization: `Bearer ${params.accessToken}`,
})

const handleFailed = (err: any) => {
  if (err.response) {
    // response status code is NOT 2xx
    log.error(
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
    log.error({ err }, 'Failed platform request - no response received')
  } else {
    log.error({ err }, 'Failed platform request - different error')
  }
  // todo: handle this does not result in 500 API error
  throw err
}

const jobCreate = async (params: JobCreateParams): Promise<JobCreateResponse> => {
  const url = `${config.platform.apiUrl}/${params.appId}/run`
  const options: AxiosRequestConfig = {
    method: 'POST',
    data: { ...omit(['accessToken', 'appId'], params) },
    url,
    headers: setupHeaders(params),
  }
  try {
    log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
    const res = await axios.request(options)
    return res.data
  } catch (err) {
    log.warn({ requestOptions: options }, 'Failed request options')
    return handleFailed(err)
  }
}

const jobTerminate = async (params: JobTerminateParams): Promise<JobTerminateResponse> => {
  const url = `${config.platform.apiUrl}/${params.jobId}/terminate`
  const options: AxiosRequestConfig = {
    method: 'POST',
    data: {},
    url,
    headers: setupHeaders(params),
  }
  try {
    log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
    const res = await axios.request(options)
    return res.data
  } catch (err) {
    log.warn({ requestOptions: options }, 'Failed request options')
    return handleFailed(err)
  }
}

const renameFolder = async (params: RenameFolderParams): Promise<ClassIdResponse> => {
  const url = `${config.platform.apiUrl}/${params.projectId}/renameFolder`
  const options: AxiosRequestConfig = {
    method: 'POST',
    data: {
      folder: params.folderPath,
      name: params.newName,
    },
    url,
    headers: setupHeaders(params),
  }
  try {
    log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
    const res = await axios.request(options)
    return res.data
  } catch (err) {
    log.warn({ requestOptions: options }, 'Failed request options')
    return handleFailed(err)
  }
}

// todo: pagination - max 10 000 objects can be removed at once
const removeFolderRec = async (params: RemoveFolderParams): Promise<ClassIdResponse> => {
  const url = `${config.platform.apiUrl}/${params.projectId}/removeFolder`
  const options: AxiosRequestConfig = {
    method: 'POST',
    data: {
      folder: params.folderPath,
      recurse: true,
    },
    url,
    headers: setupHeaders(params),
  }
  try {
    log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
    const res = await axios.request(options)
    return res.data
  } catch (err) {
    log.warn({ requestOptions: options }, 'Failed request options')
    return handleFailed(err)
  }
}

const jobDescribe = async (params: JobDescribeParams): Promise<JobDescribeResponse> => {
  const url = `${config.platform.apiUrl}/${params.jobId}/describe`
  const options: AxiosRequestConfig = {
    method: 'POST',
    data: {},
    url,
    headers: setupHeaders(params),
  }
  try {
    log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
    const res = await axios.request(options)
    return res.data
  } catch (err) {
    log.warn({ requestOptions: options }, 'Failed request options')
    return handleFailed(err)
  }
}

const filesList = async (params: ListFilesParams): Promise<ListFilesResponse> => {
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
    headers: setupHeaders(params),
  }
  try {
    log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
    const res = await axios.request(options)
    return res.data
  } catch (err) {
    log.warn({ requestOptions: options }, 'Failed request options')
    return handleFailed(err)
  }
}

// todo: this should have unit tests
const filesListPaginated = async (params: ListFilesParams): Promise<ListFilesResponse> => {
  let nextMapping: ListFilesParams['starting']
  const results: ListFilesResponse['results'] = []
  // use reduce?
  const paginateSeq = async (): Promise<void> => {
    do {
      // eslint-disable-next-line no-await-in-loop
      const res = await filesList({ ...params, starting: nextMapping })
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

// DEPRECATED, very slow
const filesDescribe = async (params: DescribeFilesParams): Promise<DescribeFilesResponse> => {
  const url = `${config.platform.apiUrl}/system/describeDataObjects`
  const results = await Promise.all(
    splitEvery(1000, params.fileIds).map(
      async (fileIds): Promise<DescribeFilesResponse> => {
        // do stuff
        const options: AxiosRequestConfig = {
          method: 'POST',
          // there cannot be more than 1000 ids otherwise it results in error
          // ids and requests should be sliced to 1000-max buckets
          // requests can run in parallel
          data: { objects: fileIds },
          url,
          headers: setupHeaders(params),
        }
        try {
          log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
          const res = await axios.request(options)
          return res.data
        } catch (err) {
          log.warn({ requestOptions: options }, 'Failed request options')
          return handleFailed(err)
        }
      },
    ),
  )
  const mapped: DescribeFilesResponse = { results: [] }
  results.forEach(r => mapped.results.push(...r.results))
  return mapped
}

const foldersList = async (params: DescribeFoldersParams): Promise<DescribeFoldersResponse> => {
  const url = `${config.platform.apiUrl}/${params.projectId}/describe`
  const options: AxiosRequestConfig = {
    method: 'POST',
    data: { fields: { folders: true } },
    url,
    headers: setupHeaders(params),
  }
  try {
    log.info({ clientOptions: options, clientUrl: url }, 'Running DNANexus API request')
    const res = await axios.request(options)
    return res.data
  } catch (err) {
    log.warn({ requestOptions: options }, 'Failed request options')
    return handleFailed(err)
  }
}

export {
  jobDescribe,
  jobCreate,
  jobTerminate,
  filesListPaginated,
  filesDescribe,
  foldersList,
  removeFolderRec,
  renameFolder,
  JobDescribeResponse,
  JobCreateParams,
  DescribeFoldersResponse,
}
