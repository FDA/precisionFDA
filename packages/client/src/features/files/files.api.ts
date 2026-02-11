import axios from 'axios'
import { cleanObject } from '../../utils/object'
import { DownloadListResponse, HomeScope, IFilter, IMeta, MetaPath, ServerScope } from '../home/types'
import { Params, formatScopeQ, prepareListFetch } from '../home/utils'
import { FileType, IExistingFileSet, IFile, IFolder, SelectedNode } from './files.types'
import { License } from '../licenses/types'

export interface FetchFilesQuery {
  files: (IFile | IFolder)[]
  meta: IMeta
}

export async function fetchFiles(filters: IFilter[], params: Params, scope?: HomeScope) {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query).toString()}`
  const scopeQ = formatScopeQ(scope)
  return axios.get<FetchFilesQuery>(`/api/files${scopeQ}${paramQ}`).then(r => r.data)
}

export interface FetchFileQuery {
  files: IFile
  meta: {
    object_license?: License
    path: MetaPath[]
  }
}

export async function fetchFile(uid: string) {
  return axios.get<FetchFileQuery>(`/api/files/${uid}`).then(r => r.data)
}

export async function fetchTrack(fileId: number) {
  return axios.get(`/api/files/${fileId}`).then(r => r.data)
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
  return axios.post('/api/files/create_folder', data).then(r => r.data)
}

export async function featureFileRequest({ ids, uids, featured }: { ids: string[]; uids: string[]; featured: boolean }) {
  return axios.put('/api/files/feature', { item_ids: [...ids, ...uids], featured }).then(r => r.data)
}

export async function copyFilesRequest(scope: string, ids: number[], folderId?: number) {
  return axios.post('/api/v2/nodes/copy', { ids, scope, folderId }).then(r => r.data)
}

export async function editFileRequest({ name, description, fileId }: { name: string; description: string; fileId: string }) {
  return axios.put(`/api/files/${fileId}`, { file: { name, description } }).then(r => r.data)
}

export async function editFolderRequest({ name, folderId }: { name: string; folderId?: number }) {
  return axios.post('/api/folders/rename_folder', { name, folder_id: folderId ?? null }).then(r => r.data)
}

export interface FetchChildrenDTO {
  scopes: ServerScope[]
  folderId?: string
  types?: FileType[]
}

export async function fetchFolderChildren(params: FetchChildrenDTO): Promise<(IFile | IFolder)[]> {
  if (params.folderId === 'ROOT') {
    params.folderId = undefined
  }
  return axios.get('/api/v2/folders/children', { params }).then(res => res.data)
}

export type MoveFilesResponse = {count: number}
export const moveFilesRequest = async (nodeIds: number[], targetFolderId: number | null, spaceId?: number) => {
  const url = spaceId ? `/api/spaces/${spaceId}/files/move` : '/api/files/move'
  const body = cleanObject({
    node_ids: nodeIds,
    target_id: targetFolderId,
  })
  return axios.post(url, body).then(res => res.data as MoveFilesResponse)
}

export async function createFile(name: string, scope: string, folder_id: string | null) {
  return axios.post('/api/create_file', { name, scope, folder_id }).then(r => r.data)
}

export async function fetchSelectedFiles(ids: number[]): Promise<SelectedNode[]> {
  return axios.get('/api/files/selected', { params: { ids: ids.join(',') } }).then(r => r.data)
}

export async function validateCopyingFiles(uids: string[], scope: ServerScope): Promise<IExistingFileSet> {
  return axios
    .post('/api/files/copy/validate', {
      uids,
      scope,
    })
    .then(r => r.data)
}
