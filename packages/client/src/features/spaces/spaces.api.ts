import axios from 'axios'
import { IFilter, MetaV2 } from '../home/types'
import { Params, prepareListFetchV2 } from '../home/utils'
import { ISpace, ISpaceV2 } from './spaces.types'

export type FetchSpacesListResponse = { meta: MetaV2; data: ISpaceV2[] }
export type FetchSpaceDetailsResponse = { meta: unknown; space: ISpace }

export async function spacesListRequest(filters: IFilter[], params: Params): Promise<FetchSpacesListResponse> {
  const spaceGroupFilter = filters.find(filter => filter.id === 'spaceGroupId' && filter.value !== undefined)
  const spaceGroupId = spaceGroupFilter ? spaceGroupFilter.value : undefined

  const query = prepareListFetchV2(
    filters.filter(filter => filter.id !== 'spaceGroupId'),
    params,
  )
  const paramQ = `?${new URLSearchParams(query).toString()}`

  if (spaceGroupId) {
    return axios.get(`/api/v2/space-groups/${spaceGroupId}/spaces/${paramQ}`).then(res => res.data)
  }

  return axios.get(`/api/v2/spaces/${paramQ}`).then(res => res.data)
}

export async function spaceRequest({ id }: { id?: string | number }): Promise<FetchSpaceDetailsResponse> {
  if (!id) {
    console.error('Space ID is required for fetching space details')
  }
  return axios.get(`/api/spaces/${id}`).then(res => res.data)
}

export async function fixGuestPermissions({ id }: { id: string | number }): Promise<unknown> {
  return axios.patch(`/api/spaces/${id}/fix_guest_permissions`).then(res => res.data)
}

export async function unlockSpaceRequest({
  link = '',
}: {
  id: string | number
  op: 'lock' | 'unlock'
  link?: string
}): Promise<unknown> {
  return axios.post(link).then(res => res.data)
}

export async function acceptSpaceRequest({ id }: { id: string | number }): Promise<unknown> {
  return axios.post(`/api/spaces/${id}/accept`).then(res => res.data)
}

export async function addDataRequest({
  spaceId,
  uids,
  properties,
}: {
  spaceId?: string
  uids: string[]
  properties?: Record<string, unknown>
}): Promise<unknown> {
  const requestProperties = properties || { createAppSeries: true, createAppRevision: false }
  return axios
    .post(`/api/spaces/${spaceId}/add_data`, {
      uids,
      properties: requestProperties,
    })
    .then(res => res.data)
}

export interface EditSpacePayload {
  name: string
  description: string
  cts?: string
}

export interface CreateSpacePayload extends EditSpacePayload {
  spaceType: ISpace['type']
  sourceSpaceId?: string | null
  hostLeadDxuser: string
  guestLeadDxuser?: string | null
  protected: boolean | null
  restrictedReviewer?: boolean
  restrictedDiscussions?: boolean | null
}

export interface EditSpaceResponse {
  id: number
  error?: Error
  errors?: {
    messages?: string[]
  }[]
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

export async function editSpaceRequest(spaceId: number, payload: EditSpacePayload): Promise<EditSpaceResponse> {
  return axios.put(`/api/v2/spaces/${spaceId}`, payload).then(res => res.data)
}

export async function updateSpacesHidden(spaceIds: number[], hidden: boolean): Promise<void> {
  await axios.patch('/api/v2/spaces/hidden', { ids: spaceIds, hidden })
}
