import axios from 'axios'
import { Asset } from '../actionModals/AttachToModal/useListAssetsQuery'
import { DeleteResponse } from '../actionModals/useDeleteModal'
import { IChallenge } from '../../types/challenge'
import { FetchAccessibleFilesResponse, fetchAccessibleFiles } from '../databases/databases.api'
import { IExecution } from '../executions/executions.types'
import { FileScope } from '../files/files.types'
import { ApiResponse, HomeScope, IFilter, IMeta, ServerScope } from '../home/types'
import { Params, formatScopeQ, prepareListFetch } from '../home/utils'
import { License } from '../licenses/types'
import { ISpace } from '../spaces/spaces.types'
import { AppRevision, AppSpec, ComputeInstance, IApp, IOSpec, InputSpec } from './apps.types'
import { CopyResponse } from '../actionModals/useCopyToPrivateModal'
import { CopyToSpaceProperties } from '../actionModals/useCopyToSpace'

export interface FetchAppsQuery {
  apps: IApp[]
  meta: IMeta
}

export interface RunJobRequest {
  id: string
  name: string
  job_limit: number
  instance_type: string
  scope: ServerScope
  output_folder_path: string
  inputs: {
    [key: string]: string | number | boolean | string[] | number[] | null | undefined | ComputeInstance
  }
}

export interface RunJobResponse {
  id: string
  error?: Error
}

export async function runJob(request: RunJobRequest) {
  return axios.post<RunJobResponse>('/apps/run', request).then(r => r.data)
}

export async function fetchApps(filters: IFilter[], params: Params): Promise<FetchAppsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query as Record<string, string>).toString()}`
  const scopeQ = formatScopeQ(params.scope as HomeScope)
  return axios.get<FetchAppsQuery>(`/api/apps${scopeQ}${paramQ}`).then(r => r.data)
}

export async function fetchSelectableSpaces(id: string): Promise<ISpace[]> {
  return axios.get(`/api/spaces/${id}/selectable_spaces`).then(d => d.data)
}

export async function fetchLicensesOnApp(uid: string): Promise<License[]> {
  return axios.get(`/api/apps/${uid}/licenses_to_accept`).then(r => r.data)
}

export async function fetchUserComputeInstances() {
  return axios.get<ComputeInstance[]>('/api/apps/user_compute_resources').then(r => r.data)
}

export async function fetchFilteredFiles({
  searchString,
  scopes,
  uid,
}: {
  searchString: string
  scopes: FileScope[]
  uid?: string[]
}): Promise<FetchAccessibleFilesResponse> {
  return fetchAccessibleFiles({
    scopes,
    uid,
    search_string: searchString,
    states: ['closed'],
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
  return axios
    .post('/api/list_apps', {
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
    })
    .then(r => r.data as IApp[])
}

export interface FetchAppsExecutionsResponse {
  jobs: IExecution[]
  meta: IMeta
}

interface FetchAppExecutionsParams extends Params {
  appUid: string
}

export async function fetchAppExecutions(
  filters: IFilter[],
  params: FetchAppExecutionsParams,
) {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query).toString()}`
  return axios.get<FetchAppsExecutionsResponse>(`/api/apps/${params.appUid}/jobs${paramQ}`).then(r => r.data)
}

export async function copyAppsRequest(scope: string, ids: string[], properties?: CopyToSpaceProperties): Promise<ApiResponse> {
  const requestProperties = properties || { createAppSeries: true, createAppRevision: false }
  return axios.post('/api/apps/copy', { item_ids: ids, scope, properties: requestProperties }).then(r => r.data)
}

export async function deleteAppsRequest(ids: string[]): Promise<DeleteResponse> {
  return axios.put('/api/apps/delete', { item_ids: ids }).then(r => r.data)
}

export async function copyAppsToPrivate(ids: number[], properties?: Record<string, unknown>): Promise<CopyResponse> {
  const requestProperties = properties || { createAppSeries: true, createAppRevision: false }
  return axios
    .post('/api/apps/copy', {
      item_ids: ids,
      scope: 'private',
      properties: requestProperties,
    })
    .then(r => r.data)
}

export interface CreateAppPayload {
  createAppSeries: boolean
  createAppRevision: boolean
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
  packages: string[]
  ordered_assets: string[]
  code: string
}

export interface CreateAppResponse {
  uid: string
}

export interface AppFetchResponse {
  app: IApp
  meta: {
    accessible_jobs_count: number
    spec: AppSpec
    internal: {
      code: string
      packages: string[]
    }
    release: string
    assets: Asset[]
    revisions: AppRevision[]
    // fields required by AppsShow
    comparator: boolean
    default_comparator: boolean
    assigned_challenges: IChallenge[]
    challenges: IChallenge[]
    links: {
      comparators: Record<string, string>
    }
  }
}

export async function createEditAppRequest(payload: CreateAppPayload): Promise<CreateAppResponse> {
  return axios.post<CreateAppResponse>('/api/v2/apps', payload).then(r => r.data)
}

export async function fetchApp(appIdentifier: string): Promise<AppFetchResponse> {
  return axios.get(`/api/apps/${appIdentifier}`).then(r => r.data as AppFetchResponse)
}

export interface UploadAppConfigFileResponse {
  id: string
  asset_uid: null | string
}

export async function uploadAppConfigFileRequest(payload: FormData): Promise<UploadAppConfigFileResponse> {
  return axios
    .post('/api/apps/import', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(r => r.data as UploadAppConfigFileResponse)
}

export async function assignToChallengeRequest({
  link,
  appId,
  challengeId,
}: {
  link: string
  appId: number
  challengeId: string
}): Promise<unknown> {
  const body = {
    app_id: appId,
    id: challengeId,
  }
  return axios.post(link, body).then(r => r.data)
}
