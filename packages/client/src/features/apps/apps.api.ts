import axios from 'axios'
import type { IChallenge } from '@/types/challenge'
import type { Asset } from '../actionModals/AttachToModal/useListAssetsQuery'
import type { CopyResponse } from '../actionModals/useCopyToPrivateModal'
import type { CopyToSpaceProperties } from '../actionModals/useCopyToSpace'
import type { DeleteResponse } from '../actionModals/useDeleteModal'
import type { ExecutionListItem } from '../executions/executions.types'
import type { ApiResponse, HomeScope, IFilter, IMeta, ServerScope } from '../home/types'
import { formatScopeQ, type Params, prepareListFetch } from '../home/utils'
import type { License } from '../licenses/types'
import type { ISpace } from '../spaces/spaces.types'
import type { AppRevision, AppSpec, ComputeInstance, IApp, InputSpec, IOSpec } from './apps.types'

export interface FetchAppsQuery {
  apps: IApp[]
  meta: IMeta
}

// TODO: Temporary converter while the Rails `/api/apps` (list) endpoint still returns
// snake_case. Remove once the list endpoint is rewritten in NestJS and returns camelCase.
type RailsApp = Record<string, unknown> & Partial<IApp>
const mapRailsAppToIApp = (raw: RailsApp): IApp => {
  const r = raw as Record<string, unknown>
  return {
    id: r.id as number,
    uid: r.uid as string,
    dxid: r.dxid as string,
    entityType: (r.entityType ?? r.entity_type) as string,
    name: r.name as string,
    title: r.title as string,
    addedBy: (r.addedBy ?? r.added_by) as string,
    addedByFullname: (r.addedByFullname ?? r.added_by_fullname) as string,
    createdAt: (r.createdAt ?? r.created_at) as string,
    createdAtDateTime: (r.createdAtDateTime ?? r.created_at_date_time) as string,
    updatedAt: (r.updatedAt ?? r.updated_at) as string,
    location: r.location as IApp['location'],
    readme: r.readme as string,
    revision: r.revision as number,
    latestRevision: (r.latestRevision ?? r.latest_revision) as boolean,
    jobCount: (r.jobCount ?? r.job_count) as number,
    appSeriesId: (r.appSeriesId ?? r.app_series_id) as number,
    runByYou: (r.runByYou ?? r.run_by_you) as string,
    org: r.org as string,
    explorers: r.explorers as number,
    featured: r.featured as boolean,
    active: r.active as boolean,
    user: r.user as IApp['user'],
    tags: (r.tags ?? []) as string[],
    properties: (r.properties ?? {}) as IApp['properties'],
    scope: r.scope as IApp['scope'],
    forkedFrom: (r.forkedFrom ?? r.forked_from ?? null) as string | null,
  }
}

export interface RunJobRequest {
  appUid: string
  name: string
  jobLimit: number
  instanceType: string
  outputFolderPath: string
  scope: ServerScope
  inputs: {
    [key: string]: string | number | boolean | string[] | number[] | null | undefined | ComputeInstance
  }
}

export interface RunJobResponse {
  id: string
  error?: Error
}

export async function runJob(runData: RunJobRequest) {
  const { appUid, ...payload } = runData
  return axios.post<RunJobResponse>(`/api/v2/apps/${appUid}/run`, payload).then(r => r.data)
}

export async function fetchApps(filters: IFilter[], params: Params): Promise<FetchAppsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query as Record<string, string>).toString()}`
  const scopeQ = formatScopeQ(params.scope as HomeScope)
  return axios.get<{ apps: RailsApp[]; meta: IMeta }>(`/api/apps${scopeQ}${paramQ}`).then(r => ({
    apps: (r.data.apps ?? []).map(mapRailsAppToIApp),
    meta: r.data.meta,
  }))
}

export async function fetchSelectableSpaces(id: string): Promise<ISpace[]> {
  return axios.get(`/api/spaces/${id}/selectable_spaces`).then(d => d.data)
}

export async function fetchLicensesOnApp(uid: string): Promise<License[]> {
  return axios.get(`/api/apps/${uid}/licenses_to_accept`).then(r => r.data)
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
    .then(r => (r.data as RailsApp[]).map(mapRailsAppToIApp))
}

export interface FetchAppsExecutionsResponse {
  jobs: ExecutionListItem[]
  meta: IMeta
}

interface FetchAppExecutionsParams extends Params {
  appUid: string
}

export async function fetchAppExecutions(filters: IFilter[], params: FetchAppExecutionsParams) {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query as Record<string, string>).toString()}`
  return axios.get<FetchAppsExecutionsResponse>(`/api/apps/${params.appUid}/jobs${paramQ}`).then(r => r.data)
}

export async function copyAppsRequest(
  scope: string,
  ids: string[],
  properties?: CopyToSpaceProperties,
): Promise<ApiResponse> {
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
    accessibleJobsCount: number
    spec: AppSpec
    internal: {
      code: string
      packages: string[]
    }
    release: string
    assets: Asset[]
    revisions: AppRevision[]
    comparator: boolean
    defaultComparator: boolean
    assignedChallenges: IChallenge[]
    challenges: IChallenge[]
  }
}

export async function createEditAppRequest(payload: CreateAppPayload): Promise<CreateAppResponse> {
  return axios.post<CreateAppResponse>('/api/v2/apps', payload).then(r => r.data)
}

export async function fetchApp(appIdentifier: string): Promise<AppFetchResponse> {
  return axios.get(`/api/v2/apps/${appIdentifier}`).then(r => r.data as AppFetchResponse)
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
