import axios from 'axios'
import { checkStatus, getApiRequestOpts, requestOpts } from '../../utils/api'
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

  const res = await fetch(`/api/dbclusters/${scopeQ}${paramQ}`)
  return res.json()
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

export async function fetchDatabaseRequest(dxid: string): Promise<FetchDatabaseRequest> {
  const res = await fetch(`/api/dbclusters/${dxid}`, {
    ...requestOpts,
  })

  return res.json()
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

export async function editDatabaseRequest(payload: EditDatabasePayload, dxid: string) {
  const res = await (await fetch(`/api/dbclusters/${dxid}`, {
    ...getApiRequestOpts('PUT'),
    body: JSON.stringify({ ...payload }),
  })).json()
  return res
}

export async function copyDatabasesRequest(scope: string, ids: string[]) {
  const res = await fetch('/api/dbclusters/copy', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids, scope }),
  }).then(checkStatus)
  return res.json()
}

export async function databaseMethodRequest(method: MethodType, dxids: string[]) {
  const res = await fetch(`/api/dbclusters/${method}`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ api_method: method, dxids }),
  }).then(checkStatus)
  return res
}
