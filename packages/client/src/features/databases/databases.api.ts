import axios from 'axios'
import { checkStatus, getApiRequestOpts } from '../../utils/api'
import { FileScope, FileState, IFile } from '../files/files.types'
import { IFilter, IMeta } from '../home/types'
import { formatScopeQ, Params, prepareListFetch } from '../home/utils'
import { IDatabase, MethodType } from './databases.types'

export interface FetchDatabaseListQuery {
  workflows: IDatabase[]
  meta: IMeta
}

export async function fetchDatabaseList(
  filters: IFilter[],
  params: Params,
): Promise<FetchDatabaseListQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = '?' + new URLSearchParams(query as {}).toString()
  const scopeQ = formatScopeQ(params.scope)
  return await axios.get(`/api/dbclusters/${scopeQ}${paramQ}`).then(r => r.data)
}

 interface AllowedInstance {
  value: string,
  label: string
}
export async function getDatabaseAllowedInstances() {
  return axios.get<AllowedInstance[]>('/api/dbclusters/allowed_instances').then(r => r.data)
}

interface FetchDatabaseRequest {
  db_cluster: IDatabase
}

export async function fetchDatabaseRequest(uid: string): Promise<IDatabase> {
  return axios.get<FetchDatabaseRequest>(`/api/dbclusters/${uid}`).then(r => r.data.db_cluster)
}

export interface IAccessibleFile extends IFile {
  title: string
  space_private: boolean
  space_public: boolean
  in_space: boolean
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
  adminPassword: string
  confirmPassword: string
  engine: string
  dxInstanceClass: string
  engineVersion: string
  ddl_file_uid: string
}


export interface Error {
  type: string;
  code: string;
  message: string;
}

export interface CreateDatabaseResponse {
  db_cluster: IDatabase
  error?: Error;
}

export async function createDatabaseRequest(payload: CreateDatabasePayload): Promise<CreateDatabaseResponse> {
  return axios.post('/api/dbclusters/', { db_cluster: payload }).then(r => r.data)
}

export interface EditDatabasePayload {
  name: string
  description: string
}

export async function editDatabaseRequest(payload: EditDatabasePayload, uid: string) {
  return await axios.put(`/api/dbclusters/${uid}`, payload).then(r => r.data)
}

export async function copyDatabasesRequest(scope: string, ids: string[]) {
  return await axios.post('/api/dbclusters/copy', { item_ids: ids, scope }).then(r => r.data)
}

export async function databaseMethodRequest(method: MethodType, dxids: string[]) {
  const res = await fetch(`/api/dbclusters/${method}`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ api_method: method, dxids }),
  }).then(checkStatus)
  return res
}
