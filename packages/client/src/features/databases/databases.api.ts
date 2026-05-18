import axios from 'axios'
import type { FileScope, FileState } from '../files/files.types'
import type { FileOrg, FileUser } from '../apps/apps.types'
import type { HomeScope, IFilter, MetaV2, ServerScope } from '../home/types'
import { formatScopeQuery, type Params, prepareListFetchV2 } from '../home/utils'
import type { IDatabase, MethodType } from './databases.types'
import type { SpaceType } from '@/features/spaces/spaces.types'

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

// different shape from /api/list_files than IFile
export interface IAccessibleFile {
  id: number
  uid: string
  name: string
  title: string
  type: string
  state: FileState | null
  scope: string
  locked: boolean
  resource?: boolean
  description: string | null
  tags: string[]
  properties: Record<string, string>
  file_size: string
  file_path: string
  space_private: boolean
  space_public: boolean
  in_space: boolean
  private?: boolean
  public?: boolean
  user?: FileUser
  org?: FileOrg
  path?: string
  spaceName?: string
  spaceType?: SpaceType
}

export interface FetchAccessibleFilesResponse {
  count: number
  objects: IAccessibleFile[]
}

interface FetchAccessibleFilesRequest {
  search_string?: string
  uid?: string[] | string
  limit?: number
  offset?: number
  scopes?: FileScope[]
  states?: FileState[]
  describe?: object
  ignore_challenge_bot?: boolean
}

export async function fetchAccessibleFiles(body: FetchAccessibleFilesRequest): Promise<FetchAccessibleFilesResponse> {
  return axios.post<FetchAccessibleFilesResponse>('/api/list_files', body).then(r => r.data)
}
export async function fetchAccessibleFilesByUID(body: FetchAccessibleFilesRequest): Promise<IAccessibleFile[]> {
  return axios.post<IAccessibleFile[]>('/api/list_files', body).then(r => r.data)
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
