import axios from 'axios'
import { checkStatus, getApiRequestOpts } from '../../../utils/api'
import { IExecution } from '../executions/executions.types'
import { IFilter, IMeta } from '../types'
import { ISpace } from '../../spaces/spaces.types'
import { formatScopeQ, Params, prepareListFetch } from '../utils'
import { ComputeInstance, IApp, ListedFiles } from './apps.types'
import { License } from '../licenses/types'

export interface FetchAppsQuery {
  apps: IApp[]
  meta: IMeta
}

export interface RunJobRequest {
  id: string // application id
  name: string // name of the job
  instance_type: string
  scope: string
  inputs: {
    [key: string]: string | number | boolean,
  };
}

interface RunJobResponse {
  id: string // id of started job
  error?: Error
}

export async function runJob(request: RunJobRequest): Promise<RunJobResponse> {
  const res = await (await fetch('/apps/run', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify(request),
  })).json()
  if(res.failure) throw new Error(res.failure)
  return res
}

export async function fetchApps(filters: IFilter[], params: Params): Promise<FetchAppsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = '?' + new URLSearchParams(query as {}).toString()
  const scopeQ = formatScopeQ(params.scope)

  const res = await fetch(`/api/apps${scopeQ}${paramQ}`).then(checkStatus)
  return res.json()
}

export async function fetchApp(uid: string): Promise<{ app: IApp, meta: any}> {
  const res = await (await fetch(`/api/apps/${uid}`)).json()
  return res
}

export async function fetchSelectableSpaces(id: string): Promise<ISpace[]> {
  return axios.get(`/api/spaces/${id}/selectable_spaces`).then(r => r.data)
}

export async function fetchLicensesOnApp(uid: string): Promise<License[]> {
  return axios.get(`/api/apps/${uid}/licenses_to_accept`).then(r => r.data)
}

export async function fetchUserComputeInstances(): Promise<ComputeInstance[]> {
  const res = await (await fetch('/api/apps/user_compute_resources')).json()
  return res
}

export async function fetchFilteredFiles(searchString: string, scopes: string[]): Promise<ListedFiles> {
  const res = await fetch('/api/list_files', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({
      'scopes': scopes,
      'search_string': searchString,
      'states': ['closed'], 'describe':
        { 'include': { 'user': true, 'org': true, 'license': true, 'all_tags_list': false }},
      'offset': 0, 'limit': 1000,
    }),
  })
  return res.json()
}

export async function fetchFiles(scopes: string[]): Promise<ListedFiles> {
  const res = await fetch('/api/list_files', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({
      'scopes': scopes,
      'states': ['closed'], 'describe':
        { 'include': { 'user': true, 'org': true, 'license': true, 'all_tags_list': false }},
      'offset': 0, 'limit': 1000,
    }),
  })
  return res.json()
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

// TODO: unused / unfinished
/*
export async function createAppRequest(name: string) {
  const res = await (await fetch(`/api/folders/`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ name })
  })).json()
  return res
}
*/

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

export async function copyAppsToPrivate(ids: string[]) {
  const res = await fetch('/api/apps/copy', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids, scope: 'private' }),
  }).then(checkStatus)

  return res.json()
}
