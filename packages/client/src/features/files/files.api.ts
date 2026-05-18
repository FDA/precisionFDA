import axios from 'axios'
import { cleanObject } from '@/utils/object'
import type { DownloadListResponse, HomeScope, IFilter, IMeta, ServerScope } from '../home/types'
import type { Params } from '../home/utils'
import { formatScopeQ, prepareListFetch } from '../home/utils'
import type { FileType, IExistingFileSet, IFile, IFolder, SelectedNode } from './files.types'

interface RailsFileLinks {
  origin_object?: { origin_type?: string; origin_uid?: string | null }
  user?: string
  space?: string
  download?: string
  [key: string]: unknown
}

interface RailsFile {
  id: number
  uid: string
  name: string
  type: string
  stiType?: string
  state: string | null
  location: string
  added_by: string
  added_by_dxuser?: string
  created_at: string
  featured: boolean
  scope: string
  space_id: string | null
  origin: unknown
  tags: string[]
  properties: Record<string, string>
  locked: boolean
  resource?: boolean
  file_size: string
  created_at_date_time: string
  description: string | null
  links?: RailsFileLinks
  file_license?: { id: string; uid: string; title: string } | null
  show_license_pending: boolean
  path?: unknown[]
  [key: string]: unknown
}

interface RailsFolder {
  id: number
  name: string
  type: string
  stiType: string
  state: null
  location: string
  added_by: string
  added_by_dxuser?: string
  created_at: string
  featured: boolean
  scope: string
  space_id: string | null
  origin: string | null
  tags: string[]
  properties: Record<string, string>
  locked: boolean
  created_at_date_time: string
  links?: RailsFileLinks
  path?: unknown[]
  [key: string]: unknown
}

function extractDxuserFromUserLink(userLink?: string): string | undefined {
  if (!userLink) {
    return undefined
  }
  const match = userLink.match(/\/users\/([^/]+)$/)
  return match?.[1]
}

function mapRailsFile(raw: RailsFile): IFile {
  return {
    id: raw.id,
    uid: raw.uid,
    name: raw.name,
    type: raw.type as IFile['type'],
    stiType: raw.stiType as IFile['stiType'],
    state: raw.state as IFile['state'],
    location: raw.location,
    addedBy: raw.added_by,
    addedByDxuser: raw.added_by_dxuser ?? extractDxuserFromUserLink(raw.links?.user),
    createdAt: raw.created_at,
    featured: raw.featured,
    scope: raw.scope as IFile['scope'],
    spaceId: raw.space_id,
    origin: raw.origin as IFile['origin'],
    originObject: raw.links?.origin_object
      ? ({
          originType: raw.links.origin_object.origin_type as IFile['originObject'],
          originUid: raw.links.origin_object.origin_uid ?? null,
        } as IFile['originObject'])
      : undefined,
    tags: raw.tags,
    properties: raw.properties,
    locked: raw.locked,
    resource: raw.resource ?? false,
    fileSize: raw.file_size,
    createdAtDateTime: raw.created_at_date_time,
    description: raw.description,
    fileLicense: raw.file_license,
    show_license_pending: raw.show_license_pending,
    requestApprovalLicenseLink:
      typeof raw.links?.request_approval_license === 'string' ? raw.links.request_approval_license : undefined,
    acceptLicenseActionLink: typeof raw.links?.accept_license_action === 'string' ? raw.links.accept_license_action : undefined,
    downloadLink: raw.links?.download,
  }
}

function mapRailsFolder(raw: RailsFolder): IFolder {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type as IFolder['type'],
    stiType: raw.stiType as IFolder['stiType'],
    state: raw.state,
    location: raw.location,
    addedBy: raw.added_by,
    addedByDxuser: raw.added_by_dxuser ?? extractDxuserFromUserLink(raw.links?.user),
    createdAt: raw.created_at,
    featured: raw.featured,
    scope: raw.scope as IFolder['scope'],
    spaceId: raw.space_id,
    origin: raw.origin,
    originObject: raw.links?.origin_object
      ? ({
          originType: raw.links.origin_object.origin_type as IFolder['originObject'],
          originUid: raw.links.origin_object.origin_uid ?? null,
        } as IFolder['originObject'])
      : undefined,
    tags: raw.tags,
    properties: raw.properties,
    locked: raw.locked,
    createdAtDateTime: raw.created_at_date_time,
    path: raw.path as IFolder['path'],
  }
}

function mapRailsNode(raw: RailsFile | RailsFolder): IFile | IFolder {
  if (raw.type === 'Folder') return mapRailsFolder(raw as RailsFolder)
  return mapRailsFile(raw as RailsFile)
}

export interface FetchFilesQuery {
  files: (IFile | IFolder)[]
  meta: IMeta
}

export interface FetchFolderChildrenResponse {
  nodes: IFolder[]
}

export async function fetchFiles(filters: IFilter[], params: Params, scope?: HomeScope): Promise<FetchFilesQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query as Record<string, string>).toString()}`
  const scopeQ = formatScopeQ(scope)
  const res = await axios.get<{ files: (RailsFile | RailsFolder)[]; meta: IMeta }>(`/api/files${scopeQ}${paramQ}`)
  return {
    files: res.data.files.map(mapRailsNode),
    meta: res.data.meta,
  }
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

export async function createFile(name: string, scope: string, folder_id: string | null): Promise<unknown> {
  return axios.post('/api/create_file', { name, scope, folder_id }).then(r => r.data)
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
