import { checkStatus, getApiRequestOpts } from '../../../utils/api'
import { IExecution } from '../executions/executions.types'
import { IFilter, IMeta } from '../types'
import { formatScopeQ, Params, prepareListFetch } from '../utils'
import { IApp } from './apps.types'

export interface FetchAppsQuery {
  apps: IApp[]
  meta: IMeta
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
