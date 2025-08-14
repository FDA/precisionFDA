import axios from 'axios'
import { FileScope, FileState, IFile } from '../files/files.types'
import { HomeScope, IFilter, MetaV2 } from '../home/types'
import { formatScopeQuery, Params, prepareListFetch } from '../home/utils'
import { IDatabase, MethodType } from './databases.types'

export interface FetchDatabaseListQuery {
  data: IDatabase[]
  meta: MetaV2
}

export async function fetchDatabaseList(filters: IFilter[], params: Params): Promise<FetchDatabaseListQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = '&' + new URLSearchParams(query).toString()
  const scopeQ = formatScopeQuery(params.scope as HomeScope, params.spaceId)
  return axios.get(`/api/v2/dbclusters/${scopeQ}${paramQ.replace('per_page', 'pageSize')}`).then(r => r.data)
}

interface AllowedInstance {
  value: string
  label: string
}
export async function getDatabaseAllowedInstances() {
  return axios.get<AllowedInstance[]>('/api/dbclusters/allowed_instances').then(r => r.data)
}

export async function fetchDatabaseRequest(uid: string): Promise<IDatabase> {
  return axios.get<IDatabase>(`/api/v2/dbclusters/${uid}`).then(r => r.data)
}

export interface IAccessibleFile extends IFile {
  title: string
  space_private: boolean
  space_public: boolean
  in_space: boolean
  file_path: string
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

export async function fetchAccessibleFiles(body: FetchAccessibleFilesRequest) {
  return axios.post<FetchAccessibleFilesResponse>('/api/list_files', body).then(r => r.data)
}
export async function fetchAccessibleFilesByUID(body: FetchAccessibleFilesRequest) {
  return axios.post<IAccessibleFile[]>('/api/list_files', body).then(r => r.data)
}

export interface CreateDatabasePayload {
  name: string
  description: string
  scope: string
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

export async function editDatabaseRequest(payload: EditDatabasePayload, uid: string) {
  return axios.put(`/api/v2/dbclusters/${uid}`, payload).then(r => r.data)
}

export async function copyDatabasesRequest(scope: string, ids: string[]) {
  return axios.post('/api/dbclusters/copy', { item_ids: ids, scope }).then(r => r.data)
}

export async function databaseMethodRequest(method: MethodType, dxids: string[]) {
  return axios.post(`/api/dbclusters/${method}`, { api_method: method, dxids }).then(r => r.data)
}
