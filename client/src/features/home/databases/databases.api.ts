import { checkStatus, getApiRequestOpts, requestOpts } from "../../../utils/api";
import { IFile } from "../files/files.types";
import { IFilter, IMeta, ResourceScope } from "../types";
import { formatScopeQ, Params, prepareListFetch } from "../utils";
import { IDatabase, MethodType } from "./databases.types";

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

interface FetchDatabaseRequest {
  db_cluster: IDatabase
}

export async function fetchDatabaseRequest(dxid: string): Promise<FetchDatabaseRequest> {
  const res = await fetch(`/api/dbclusters/${dxid}`, {
    ...requestOpts,
  })
  
  return res.json()
}

interface IAccessibleFiles extends IFile {
  title: string
}

export async function fetchAccessibleFiles(): Promise<IAccessibleFiles[]> {
  const res = await (await fetch('/api/list_files', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ scopes: []})
  })).json()
  if(res.failure) throw new Error(res.failure)
  return res
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
  const res = await fetch(`/api/dbclusters/`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ db_cluster: payload })
  })
  return res.json()
}

export interface EditDatabasePayload {
  name: string
  description: string
}

export async function editDatabaseRequest(payload: EditDatabasePayload, dxid: string) {
  const res = await (await fetch(`/api/dbclusters/${dxid}`, {
    ...getApiRequestOpts('PUT'),
    body: JSON.stringify({ ...payload })
  })).json()
  return res
}

export async function copyDatabasesRequest(scope: string, ids: string[]) {
  const res = await fetch(`/api/dbclusters/copy`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids, scope })
  }).then(checkStatus)
  return res.json()
}

export async function databaseMethodRequest(method: MethodType, dxids: string[]) {
  const res = await fetch(`/api/dbclusters/${method}`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ api_method: method, dxids })
  }).then(checkStatus)
  return res
}
