import axios from 'axios'
import { checkStatus, getApiRequestOpts } from '../../utils/api'
import { ISpace } from '../spaces/spaces.types'
import { Asset } from '../actionModals/AttachToModal/useListAssetsQuery'
import { FetchAccessibleFilesResponse, fetchAccessibleFiles } from '../databases/databases.api'
import { IExecution } from '../executions/executions.types'
import { FileScope } from '../files/files.types'
import { License } from '../licenses/types'
import { IFilter, IMeta, ServerScope } from '../home/types'
import { Params, formatScopeQ, prepareListFetch } from '../home/utils'
import { AppSpec, ComputeInstance, IApp, IOSpec, InputSpec, AppRevision } from './apps.types'

export interface FetchAppsQuery {
  apps: IApp[]
  meta: IMeta
}

export interface RunJobRequest {
  id: string // application id
  name: string // name of the job
  job_limit: number,
  instance_type: string
  scope: ServerScope
  output_folder_path: string
  inputs: {
    [key: string]: string | number | boolean | string[] | number[] | null | undefined,
  };
}

export interface RunJobResponse {
  id: string // id of started job
  error?: Error
}

export async function runJob(request: RunJobRequest) {
  return axios.post<RunJobResponse>('/apps/run', request).then(r => r.data)
}

export async function fetchApps(filters: IFilter[], params: Params): Promise<FetchAppsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query as {}).toString()}`
  const scopeQ = formatScopeQ(params.scope)
  return axios.get<FetchAppsQuery>(`/api/apps/${scopeQ}${paramQ}`).then(r => r.data)
}

export async function fetchSelectableSpaces(id: string): Promise<ISpace[]> {
  return axios.get(`/api/spaces/${id}/selectable_spaces`).then(d => d.data)
}

export async function fetchLicensesOnApp(uid: string): Promise<License[]> {
  return axios.get(`/api/apps/${uid}/licenses_to_accept`).then(r => r.data)
}

export async function fetchUserComputeInstances(){
  return axios.get<ComputeInstance[]>('/api/apps/user_compute_resources').then(r => r.data)
}

export async function fetchFilteredFiles({ searchString, scopes, uid }: { searchString: string; scopes: FileScope[], uid?: string[] }): Promise<FetchAccessibleFilesResponse> {
  return fetchAccessibleFiles({
    scopes,
    uid,
    search_string: searchString,
    states: [ 'closed' ],
    describe: {
      include: {
        user: true,
        org: true,
        license: true,
        all_tags_list: false,
      },
    },
    offset: 0,
    limit: 1000,
    ignore_challenge_bot: true,
  })
}

export async function fetchFilteredApps(searchString: string, scopes: ServerScope[]): Promise<IApp[]> {
  return axios.post('/api/list_apps', {
    scopes,
    search_string: searchString,
    describe: {
      include: {
        user: true,
        org: true,
        all_tags_list: false,
      },
    },
    offset: 0,
    limit: 1000,
  }).then(r => r.data as IApp[])
}

export interface FetchAppsExecutionsQuery {
  jobs: IExecution[]
  meta: IMeta
}

interface FetchAppExecutionsParams extends Params {
  appUid: string
}

export async function fetchAppExecutions(filters: IFilter[], params: FetchAppExecutionsParams): Promise<FetchAppsExecutionsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query as any).toString()}`
  const res = await fetch(`/api/apps/${params.appUid}/jobs${paramQ}`)
  return res.json()
}

export async function copyAppsRequest(scope: string, ids: string[]) {
  const res = await fetch('/api/apps/copy', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids, scope }),
  }).then(checkStatus)
  return res.json()
}

export async function deleteAppsRequest(ids: string[]): Promise<any> {
  const res = await fetch('/api/apps/delete', {
    ...getApiRequestOpts('PUT'),
    body: JSON.stringify({ item_ids: ids }),
  }).then(checkStatus)
  return res.json()
}

export async function copyAppsToPrivate(ids: number[]) {
  const res = await fetch('/api/apps/copy', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids, scope: 'private' }),
  }).then(checkStatus)

  return res.json()
}



export interface CreateAppPayload {
  is_new: boolean
  forked_from: null | string
  name: string
  scope: ServerScope
  title: string
  release: string
  readme: string
  input_spec: InputSpec[]
  output_spec: IOSpec[]
  internet_access: boolean
  instance_type: string
  packages: any[]
  ordered_assets: string[]
  code: string
}


export interface CreateAppResponse {
  id: string
}

export interface AppFetchResponse {
  app: IApp
  meta: {
    accessible_jobs_count: number;
    spec: AppSpec
    internal: {
      code: string,
      packages: any[]
    }
    release: string
    assets: Asset[]
    revisions: AppRevision[]
  }
}

export async function createEditAppRequest(payload: CreateAppPayload): Promise<CreateAppResponse> {
  return axios.post<CreateAppResponse>('/api/apps', payload).then(r => r.data)
}

export async function fetchApp(uid: string): Promise<AppFetchResponse> {
  return axios.get(`/api/apps/${uid}`).then(r => r.data as AppFetchResponse)
}

export interface UploadAppConfigFileResponse {
  id: string
  asset_uid: null | string
}

export async function uploadAppConfigFileRequest(payload: FormData): Promise<UploadAppConfigFileResponse> {
  return axios.post('/api/apps/import', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data as UploadAppConfigFileResponse)
}
