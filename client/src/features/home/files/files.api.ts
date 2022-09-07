import { checkStatus, getApiRequestOpts } from '../../../utils/api'
import { cleanObject } from '../../../utils/object'
import { BaseError, DownloadListResponse, IFilter, IMeta, ResourceScope } from '../types'
import { formatScopeQ, Params, prepareListFetch } from '../utils'
import { IFile } from './files.types'

export interface FetchFilesQuery {
  files: IFile[]
  meta: IMeta
}



export async function fetchFiles(
  filters: IFilter[],
  params: Params,
): Promise<FetchFilesQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${  new URLSearchParams(query as {}).toString()}`
  const scopeQ = formatScopeQ(params.scope)

  const res = await fetch(`/api/files${scopeQ}${paramQ}`).then(checkStatus)
  return res.json()
}

export async function fetchFile(uid: string): Promise<{ files: IFile, meta: any }> {
  const res = await fetch(`/api/files/${uid}`).then(checkStatus)
  return res.json()
}

export async function fetchTrack(fileId: number) {
  const res = await fetch(`/api/files/${fileId}`).then(checkStatus)
  return res.json()
}

export async function fetchFilesDownloadList(ids: string[], scope: string): Promise<DownloadListResponse[]> {
  const res = await fetch('/api/files/download_list', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({
      task: 'delete', ids, scope,
    }),
  }).then(checkStatus)
  return res.json()
}

export async function deleteFilesRequest(ids: string[]): Promise<any> {
  const res = await fetch('/api/files/remove', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ ids }),
  }).then(checkStatus)
  return res.json()
}

export async function addFolderRequest({ name }: { name: string }, parentFolderId?: string, spaceId?: string, scope?: ResourceScope) {
  const data = cleanObject({ name, parent_folder_id: parentFolderId ?? null, public: scope === 'everybody' ? 'true' : null, space_id: spaceId ?? undefined })
  const res = await fetch('/api/files/create_folder', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify(data),
  }).then(checkStatus)
  return res.json()
}

export async function featureFileRequest({ ids, uids, featured }: { ids: string[], uids: string[], featured: boolean }) {
  const res = await fetch('/api/files/feature', {
    ...getApiRequestOpts('PUT'),
    body: JSON.stringify({ item_ids: [...ids, ...uids], featured }),
  }).then(checkStatus)
  return res.json()
}

export async function copyFilesRequest(scope: string, ids: string[]) {
  const item_ids = ids.map(id => parseInt(id, 10))
  const res = await fetch('/api/files/copy', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids, scope }),
  }).then(checkStatus)
  return res.json()
}

export async function editFileRequest({ name, description, fileId }: { name: string, description: string, fileId: string }) {
  const res = await fetch(`/api/files/${fileId}`, {
    ...getApiRequestOpts('PUT'),
    body: JSON.stringify({ file: { name, description }}),
  }).then(checkStatus)
  return res.json()
}

export async function editFolderRequest({ name, folderId }: { name: string, folderId?: string }) {
  const res = await (await fetch('/api/folders/rename_folder', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ name, folder_id: folderId ?? null }),
  })).json()
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
  nodes: IFile[];
}

export const fetchFolderChildren = async (scope?: 'private' | 'public', spaceId?: string, folderId?: string): Promise<FetchFolderChildrenResponse> => {
  const queryParams = cleanObject({
    folder_id: folderId === 'ROOT' ? undefined : folderId,
    scope,
  })

  const query = `?${new URLSearchParams(queryParams as Record<string, string>).toString()}`
  const url = spaceId ? `/api/spaces/${spaceId}/files/subfolders${query}` : `/api/folders/children${query}`
  const res = await fetch(url, {
    method: 'GET',
  }).then(checkStatus)
  return res.json()
}

export const moveFilesRequest = async (nodeIds: string[], targetId: string, scope?: ResourceScope, spaceId?: string) => {
  const url = spaceId ? `/api/spaces/${spaceId}/files/move` : '/api/files/move'
  const body = cleanObject({
    node_ids: nodeIds,
    target_id: parseInt(targetId, 10) || null,
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
    body: JSON.stringify({ name, scope: scope === 'everybody' ? 'public' : null, folder_id }),
  }).then(checkStatus)

  return res.json()
}

export async function copyFilesToPrivate(ids: string[]) {
  const res = await fetch('/api/files/copy', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids, scope: 'private' }),
  }).then(checkStatus)

  return res.json()
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

export async function closeFile(id: string) {
  const res = await fetch('/api/close_file', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ id }),
  }).then(checkStatus)
  return res.json()
}
