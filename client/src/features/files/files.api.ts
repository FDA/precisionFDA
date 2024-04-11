import axios from 'axios'
import { checkStatus, getApiRequestOpts } from '../../utils/api'
import { cleanObject } from '../../utils/object'
import { DownloadListResponse, IFilter, IMeta, HomeScope } from '../home/types'
import { formatScopeQ, Params, prepareListFetch } from '../home/utils'
import { IFile } from './files.types'

export interface FetchFilesQuery {
  files: IFile[]
  meta: IMeta
}

export async function fetchFiles(filters: IFilter[], params: Params) {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query as {}).toString()}`
  const scopeQ = formatScopeQ(params.scope)
  return axios.get<FetchFilesQuery>(`/api/files${scopeQ}${paramQ}`).then(r => r.data)
}

export interface FetchFileQuery {
  files: IFile
  meta: any
}

export async function fetchFile(uid: string) {
  return axios.get<FetchFileQuery>(`/api/files/${uid}`).then(r => r.data)
}

export async function fetchTrack(fileId: number) {
  const res = await fetch(`/api/files/${fileId}`).then(checkStatus)
  return res.json()
}

export async function fetchFilesDownloadList(ids: number[], task: string, scope?: string) {
  return axios
    .post('/api/files/download_list', {
      task,
      ids,
      scope,
    })
    .then(r => r.data as DownloadListResponse[])
}

export async function fetchFilesListLockingRequest(ids: number[], scope?: string, task?: string) {
  return axios
    .post('/api/files/download_list', {
      task,
      ids,
      scope,
    })
    .then(r => r.data as DownloadListResponse[])
}

export async function deleteFilesRequest(ids: number[]) {
  return axios.post('/api/files/remove', { ids }).then(r => r.data)
}

export type LockUnlockActionType = 'lock' | 'unlock'

export async function lockUnlockFilesRequest(ids: number[], type: LockUnlockActionType) {
  return axios.post(`/api/nodes/${type}`, { ids }).then(r => r.data)
}

export async function addFolderRequest(
  { name }: { name: string },
  parentFolderId?: string,
  spaceId?: string,
  homeScope?: HomeScope,
) {
  const data = cleanObject({
    name,
    parent_folder_id: parentFolderId ?? null,
    public: homeScope === 'everybody' ? 'true' : null,
    space_id: spaceId ?? null,
  })
  const res = await fetch('/api/files/create_folder', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify(data),
  }).then(checkStatus)
  return res.json()
}

export async function featureFileRequest({ ids, uids, featured }: { ids: string[]; uids: string[]; featured: boolean }) {
  const res = await fetch('/api/files/feature', {
    ...getApiRequestOpts('PUT'),
    body: JSON.stringify({ item_ids: [...ids, ...uids], featured }),
  }).then(checkStatus)
  return res.json()
}

export async function copyFilesRequest(scope: string, ids: string[]) {
  const item_ids = ids.map(id => parseInt(id, 10))
  return axios.post('/api/files/copy', { item_ids, scope }).then(r => r.data)
}

export async function editFileRequest({ name, description, fileId }: { name: string; description: string; fileId: string }) {
  const res = await fetch(`/api/files/${fileId}`, {
    ...getApiRequestOpts('PUT'),
    body: JSON.stringify({ file: { name, description }}),
  }).then(checkStatus)
  return res.json()
}

export async function editFolderRequest({ name, folderId }: { name: string; folderId?: string }) {
  const res = await (
    await fetch('/api/folders/rename_folder', {
      ...getApiRequestOpts('POST'),
      body: JSON.stringify({ name, folder_id: folderId ?? null }),
    })
  ).json()
  return res
}

export async function uploadFilesRequest(blobs: any[]) {
  const res = await fetch('/api/folders/', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ name }),
  }).then(checkStatus)
  return res.json()
}

export interface FetchFolderChildrenResponse {
  nodes: IFile[]
}

export const fetchFolderChildren = async (scope?: 'private' | 'public', spaceId?: string, folderId?: string) => {
  const queryParams = cleanObject({
    folder_id: folderId === 'ROOT' ? undefined : folderId,
    scope,
  })

  const query = `?${new URLSearchParams(queryParams as Record<string, string>).toString()}`
  const url = spaceId ? `/api/spaces/${spaceId}/files/subfolders${query}` : `/api/folders/children${query}`
  return axios.get(url).then(res => res.data as FetchFolderChildrenResponse)
}

export const moveFilesRequest = async (nodeIds: number[], targetFolderId: number, homeScope?: HomeScope, spaceId?: string) => {
  const url = spaceId ? `/api/spaces/${spaceId}/files/move` : '/api/files/move'
  const body = cleanObject({
    node_ids: nodeIds,
    target_id: targetFolderId,
  })

  const res = await fetch(url, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify(body),
  }).then(checkStatus)
  return res.json()
}

export async function createFile(name: string, scope: string, folder_id: string | null) {
  const res = await fetch('/api/create_file', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ name, scope, folder_id }),
  }).then(checkStatus)

  return res.json()
}

export async function copyFilesToPrivate(ids: number[]) {
  return axios.post('/api/files/copy', { item_ids: ids, scope: 'private' }).then(r => r.data)
}

export async function getUploadURL(id: string, index: number, size: number, md5: string) {
  const res = await fetch('/api/get_upload_url', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ id, index, size, md5 }),
  }).then(checkStatus)

  return res.json()
}

export async function uploadChunk(url: string, chunk: ArrayBuffer, headers: any) {
  return fetch(url, {
    method: 'PUT',
    body: chunk,
    headers,
  })
}

export async function closeFile(uid: string) {
  const res = await fetch('/api/close_file', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ uid }),
  }).then(checkStatus)
  return res.json()
}
