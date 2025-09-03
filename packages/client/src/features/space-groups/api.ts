import axios from 'axios'
import { IdResponse } from '../discussions/api'
import { ISpaceGroup } from './spaceGroups.types'

export interface SpaceGroupPayload {
  id?: number
  name: string
  description: string
}

export async function createSpaceGroupRequest(payload: SpaceGroupPayload): Promise<IdResponse> {
  return axios.post('/api/v2/space-groups', payload).then(res => res.data)
}

export async function updateSpaceGroupRequest(payload: SpaceGroupPayload) {
  return axios.put(`/api/v2/space-groups/${payload.id}`, payload).then(res => res.data)
}

export async function deleteSpaceGroupRequest(id: number): Promise<void> {
  return axios.delete(`/api/v2/space-groups/${id}`).then(res => res.data)
}

export async function spaceGroupsListRequest(): Promise<ISpaceGroup[]> {
  return axios.get('/api/v2/space-groups').then(res => res.data)
}

export async function spaceGroupByIdRequest(id: number | string) {
  return axios.get(`/api/v2/space-groups/${id}`).then(res => res.data as ISpaceGroup)
}

export async function addSpacesToSpaceGroup(spaceGroupId: number, spaceIds: number[]): Promise<void> {
  return axios.post(`/api/v2/space-groups/${spaceGroupId}/spaces`, { spaceIds }).then(res => res.data)
}

export async function removeSpaces(spaceGroupId: number, spaceIds: number[]): Promise<void> {
  const params = new URLSearchParams()
  spaceIds.forEach(id => params.append('spaceIds', id.toString()))

  await axios.delete(`/api/v2/space-groups/${spaceGroupId}/spaces`, { params })
}
