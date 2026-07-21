import axios from 'axios'
import type { EntityUidResponse } from '@/api/types'
import type { PaginationMetaV2 } from '@/types/pagination'
import { cleanObject } from '@/utils/object'
import type { DownloadListResponse, HomeScope, IFilter, MetaV2, ServerScope } from '../home/types'
import { type Params, prepareListFetchV2 } from '../home/utils'
import type { FileState, FileType, IExistingFileSet, IFile, IFolder, INode, SelectedNode } from './files.types'

export interface FetchFilesQuery {
  files: INode[]
  meta: MetaV2
}

export interface FetchFolderChildrenResponse {
  nodes: IFolder[]
}

const SCOPE_DICT: Record<HomeScope, ServerScope | 'spaces'> = {
  me: 'private',
  everybody: 'public',
  featured: 'public',
  spaces: 'spaces',
}

export async function fetchFile(uid: string): Promise<IFile> {
  const res = await axios.get<IFile>(`/api/v2/files/${uid}`)
  return res.data
}

export async function fetchFilesDownloadList(
  ids: number[],
  task: string,
  scope?: string,
): Promise<DownloadListResponse[]> {
  return axios
    .post('/api/files/download_list', {
      task,
      ids,
      scope,
    })
    .then(r => r.data as DownloadListResponse[])
}

export async function fetchFilesListLockingRequest(
  ids: number[],
  scope?: string,
  task?: string,
): Promise<DownloadListResponse[]> {
  return axios
    .post('/api/files/download_list', {
      task,
      ids,
      scope,
    })
    .then(r => r.data as DownloadListResponse[])
}

export async function deleteFilesRequest(ids: number[]): Promise<unknown> {
  return axios.delete('/api/v2/nodes/remove', { data: { ids, async: true } }).then(r => r.data)
}

export type LockUnlockActionType = 'lock' | 'unlock'

export async function lockUnlockFilesRequest(ids: number[], type: LockUnlockActionType): Promise<unknown> {
  return axios.post(`/api/nodes/${type}`, { ids }).then(r => r.data)
}

export async function addFolderRequest(
  { name }: { name: string },
  parentFolderId?: string,
  spaceId?: string,
  homeScope?: HomeScope,
): Promise<unknown> {
  const data = cleanObject({
    name,
    parent_folder_id: parentFolderId ?? null,
    public: homeScope === 'everybody' ? 'true' : null,
    space_id: spaceId ?? null,
  })
  return axios.post('/api/files/create_folder', data).then(r => {
    // Handle error responses that come with 200 status code
    if (r.data.message?.type === 'error') {
      const errorText = Array.isArray(r.data.message.text) ? r.data.message.text.join(', ') : r.data.message.text
      throw new Error(errorText)
    }
    return r.data
  })
}

export async function featureFileRequest({
  ids,
  uids,
  featured,
}: {
  ids: string[]
  uids: string[]
  featured: boolean
}): Promise<unknown> {
  return axios.put('/api/files/feature', { item_ids: [...ids, ...uids], featured }).then(r => r.data)
}

export async function copyFilesRequest(scope: string, ids: number[], folderId?: number): Promise<unknown> {
  return axios.post('/api/v2/nodes/copy', { ids, scope, folderId }).then(r => r.data)
}

export async function editFileRequest({
  name,
  description,
  fileId,
}: {
  name: string
  description: string
  fileId: string
}): Promise<unknown> {
  return axios.put(`/api/files/${fileId}`, { file: { name, description } }).then(r => r.data)
}

export async function editFolderRequest({ name, folderId }: { name: string; folderId?: number }): Promise<unknown> {
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

export type MoveFilesResponse = { count: number }
export const moveFilesRequest = async (
  nodeIds: number[],
  targetFolderId: number | null,
  spaceId?: number,
): Promise<MoveFilesResponse> => {
  const url = spaceId ? `/api/spaces/${spaceId}/files/move` : '/api/files/move'
  const body = cleanObject({
    node_ids: nodeIds,
    target_id: targetFolderId,
  })
  return axios.post(url, body).then(res => res.data as MoveFilesResponse)
}

export async function createFile(name: string, scope: string, folderId: string | null): Promise<EntityUidResponse> {
  return axios.post('/api/v2/files', { name, scope, folderId }).then(r => r.data)
}

export async function fetchSelectedFiles(ids: number[]): Promise<SelectedNode[]> {
  return axios.get('/api/v2/files/selected', { params: { ids: ids.join(',') } }).then(r => r.data)
}

export async function validateCopyingFiles(uids: string[], scope: ServerScope): Promise<IExistingFileSet> {
  return axios
    .post('/api/v2/files/copy/validate', {
      uids,
      scope,
    })
    .then(r => r.data)
}

export interface FetchAccessibleFilesRequest {
  scope?: ServerScope
  uids?: string[] | string
  page?: number
  type?: FileType[]
  folderId?: number | 'null'
  pageSize?: number
  ignoreChallengeBot?: boolean
  ignoreComparison?: boolean
  filter?: {
    states?: FileState[]
    name?: string
    tags?: string[]
    size?: string
    addedBy?: string
    location?: string
  }
  fields?: {
    license?: boolean
    properties?: boolean
    tags?: boolean
    path?: boolean
    origin?: boolean
  }
}

export interface FetchAccessibleFilesResponse {
  data: INode[]
  meta: PaginationMetaV2
}

export interface VerifyAccessibleFilesResponse {
  valid: string[]
  invalid: string[]
}

export async function fetchAccessibleFiles(params: FetchAccessibleFilesRequest): Promise<FetchAccessibleFilesResponse> {
  return axios.get<FetchAccessibleFilesResponse>('/api/v2/files', { params }).then(r => r.data)
}

export async function verifyAccessibleFiles(uids: string[]): Promise<VerifyAccessibleFilesResponse> {
  return axios.get<VerifyAccessibleFilesResponse>('/api/v2/files/accessibility', { params: { uids } }).then(r => r.data)
}

export async function fetchFiles(filter: IFilter[], params: Params): Promise<FetchFilesQuery> {
  const query = prepareListFetchV2(filter, params)

  // normalize fileSize filter
  // TODO(PFDA-7013): refactor size filter after rewriting /assets to Node
  if (query['filter[fileSize]']) {
    const sizeFilter = query['filter[fileSize]'] as { from: number | null; to: number | null }
    query['filter[size]'] =
      `${sizeFilter.from ? sizeFilter.from * 1024 : ''},${sizeFilter.to ? sizeFilter.to * 1024 : ''}`
    delete query['filter[fileSize]']
  }

  const scopeFilter: Record<string, unknown> = params.spaceId
    ? { scope: `space-${params.spaceId}` }
    : {
        // biome-ignore lint/style/noNonNullAssertion: scope is non-null if spaceId is not provided
        scope: SCOPE_DICT[params.scope!],
        ...(params.scope === 'everybody' && { ignoreComparison: false, ignoreChallengeBot: false }),
        ...(params.scope === 'featured' && { featured: true }),
      }

  const res = await fetchAccessibleFiles({
    type: ['UserFile', 'Folder'],
    fields: {
      properties: true,
      tags: true,
      origin: true,
      path: true,
    },
    folderId: params.folderId ? parseInt(params.folderId, 10) : 'null',
    ...scopeFilter,
    ...query,
  })
  return {
    files: res.data,
    meta: res.meta,
  }
}
