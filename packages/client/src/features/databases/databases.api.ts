import axios from 'axios'
import type { HomeScope, IFilter, MetaV2, ServerScope } from '../home/types'
import { formatScopeQuery, type Params, prepareListFetchV2 } from '../home/utils'
import type { IDatabase, MethodType } from './databases.types'

export interface FetchDatabaseListQuery {
  data: IDatabase[]
  meta: MetaV2
}

function normalizeDbClusterFilterKeys(query: Record<string, string>): Record<string, string> {
  const normalized = { ...query }

  if (normalized['filter[type]']) {
    normalized['filter[engine]'] = normalized['filter[type]']
    delete normalized['filter[type]']
  }

  if (normalized['filter[dxInstanceClass]']) {
    normalized['filter[instance]'] = normalized['filter[dxInstanceClass]']
    delete normalized['filter[dxInstanceClass]']
  }

  if (normalized['filter[dx_instance_class]']) {
    normalized['filter[instance]'] = normalized['filter[dx_instance_class]']
    delete normalized['filter[dx_instance_class]']
  }

  return normalized
}

export async function fetchDatabaseList(filters: IFilter[], params: Params): Promise<FetchDatabaseListQuery> {
  const query = normalizeDbClusterFilterKeys(prepareListFetchV2(filters, params))
  const paramQ = '&' + new URLSearchParams(query).toString()
  const scopeQ = formatScopeQuery(params.scope as HomeScope, params.spaceId)
  return axios.get(`/api/v2/dbclusters/${scopeQ}${paramQ}`).then(r => r.data)
}

export async function fetchDatabaseRequest(uid: string): Promise<IDatabase> {
  return axios.get<IDatabase>(`/api/v2/dbclusters/${uid}`).then(r => r.data)
}

export interface CreateDatabasePayload {
  name: string
  description: string
  scope: ServerScope
  engine: string | null
  dxInstanceClass: string
  engineVersion: string
}

export interface Error {
  type: string
  code: string
  message: string
}

export async function createDatabaseRequest(payload: CreateDatabasePayload): Promise<IDatabase> {
  return axios.post('/api/v2/dbclusters/', payload).then(r => r.data)
}

export interface EditDatabasePayload {
  name: string
  description: string
}

export async function editDatabaseRequest(payload: EditDatabasePayload, uid: string): Promise<void> {
  return axios.put(`/api/v2/dbclusters/${uid}`, payload).then(r => r.data)
}

export async function databaseMethodRequest(method: MethodType, dxids: string[]): Promise<unknown> {
  return axios.post(`/api/v2/dbclusters/${method}`, { dxids }).then(r => r.data)
}
