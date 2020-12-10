// just a bunch of api calls that will be easy to mock
import axios, { AxiosRequestConfig } from 'axios'
import { omit } from 'ramda'
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
}

type DescribeFilesParams = BaseParams & {
  fileIds: string[]
}

type ListFilesResponse = {
  results: Array<{
    id: string
    project: string
  }>
  next?: boolean
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

type JobCreateResponse = {
  id: string
}

type JobTerminateResponse = JobCreateResponse

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
  const scope = {
    project: params.project,
    folder: params.folder ?? '/',
  }
  const url = `${config.platform.apiUrl}/system/findDataObjects`
  const options: AxiosRequestConfig = {
    method: 'POST',
    data: { class: 'file', scope },
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

const filesDescribe = async (params: DescribeFilesParams): Promise<DescribeFilesResponse> => {
  const url = `${config.platform.apiUrl}/system/describeDataObjects`
  const options: AxiosRequestConfig = {
    method: 'POST',
    data: { objects: params.fileIds },
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
  filesList,
  filesDescribe,
  JobDescribeResponse,
  JobCreateParams,
}
