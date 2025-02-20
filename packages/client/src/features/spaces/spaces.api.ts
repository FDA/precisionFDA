import axios from 'axios'
import { getApiRequestOpts } from '../../utils/api'
import { IFilter } from '../home/types'
import { Params, prepareListFetch } from '../home/utils'
import { ISpace } from './spaces.types'

export type FetchSpacesListResponse = { meta: unknown; spaces: ISpace[] }
export type FetchSpaceDetailsResponse = { meta: unknown; space: ISpace }

export async function spacesListRequest(filters: IFilter[], params: Params): Promise<{ meta: any; spaces: ISpace[] }> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query as {}).toString()}`
  return axios.get(`/api/spaces/${paramQ}`).then(res => res.data)
}

export async function spaceRequest({ id }: { id: number }): Promise<FetchSpaceDetailsResponse> {
  return axios.get(`/api/spaces/${id}`).then(res => res.data)
}

export async function fixGuestPermissions({ id }: { id: string }): Promise<unknown> {
  return axios.patch(`/api/spaces/${id}/fix_guest_permissions`).then(res => res.data)
}

export async function unlockSpaceRequest({ link = '' }: { id: string; op: 'lock' | 'unlock'; link?: string }): Promise<unknown> {
  // const res = await fetch(`/api/spaces/${id}/${op}`, { method: 'POST'})
  const res = await fetch(link, {
    ...getApiRequestOpts('POST'),
  })
  return res.json()
}

export async function addData({
  spaceId,
  folderId,
  uids,
}: {
  spaceId: string
  folderId: string
  uids: string[]
}): Promise<unknown> {
  return fetch(`/api/spaces/${spaceId}/add_data/`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ uids, folder_id: folderId }),
  })
}

export async function acceptSpaceRequest({ id }: { id: string }): Promise<unknown> {
  const res = await fetch(`/api/spaces/${id}/accept`, {
    ...getApiRequestOpts('POST'),
  })
  return res.json()
}

export async function addDataRequest({
  spaceId,
  uids,
  properties,
}: {
  spaceId: string
  uids: string[]
  properties?: Record<string, any>
}): Promise<any> {
  const requestProperties = properties || { createAppSeries: true, createAppRevision: false }
  return axios
    .post(`/api/spaces/${spaceId}/add_data`, {
      uids,
      properties: requestProperties,
    })
    .then(res => res.data)
}

export interface CreateSpacePayload {
  name: string
  description: string
  spaceType: ISpace['type']
  sourceSpaceId?: string | null
  guestLeadDxuser?: string | null
  hostLeadDxuser?: string | null
  sponsorLeadDxuser?: string | null
  cts?: string
  protected: boolean | null
  restrictedReviewer?: boolean
  restrictedDiscussions?: boolean | null
}

export interface EditSpaceResponse {
  space: { id: number }
  error?: Error
  errors?: string[]
}

export interface CreateSpaceResponse {
  id: number
}

export interface EditableSpace {
  scope: string
  name: string
  type: 'groups' | 'review' | 'verification' | 'private_type' | 'government' | 'administrator'
  title: string
  protected: boolean
  restricted_reviewer?: boolean
}

export type EditableSpacesResponse = EditableSpace[]

export async function fetchEditableSpacesList(): Promise<EditableSpacesResponse> {
  return axios.get('/api/spaces/editable_spaces').then(res => res.data)
}

export async function createSpaceRequest(payload: CreateSpacePayload): Promise<CreateSpaceResponse> {
  return axios.post('/api/v2/spaces', payload).then(res => res.data)
}

export async function editSpaceRequest(spaceId: number, payload: CreateSpacePayload): Promise<EditSpaceResponse> {
  // TODO temporarily until edit is moved from ruby to node PFDA-6046
  payload.sponsorLeadDxuser = payload.guestLeadDxuser
  return axios.put(`/api/spaces/${spaceId}`, { space: payload }).then(res => res.data)
}

export async function updateSpacesHidden(spaceIds: number[], hidden: boolean): Promise<void> {
  await axios.patch('/api/v2/spaces/hidden', { ids: spaceIds, hidden })
}
