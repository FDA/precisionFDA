import axios, { AxiosRequestConfig } from 'axios'
import { InvitationListType } from './invitations/types'

export interface AdminStats {
  usersCount: number
  orgsCount: number
}

export type Invitation = {
  id: number
  firstName: string
  lastName: string
  email: string
  duns: string
  provisioningState: 'pending' | 'in_progress' | 'failed' | 'finished'
  createdAt: string
  updatedAt: string
}

export type SpaceGroup = {
  id: number
  name: string
  description: string
  spaces: {
    id: number
    name: string
    type: string
    isActiveMember: boolean
  }[]
}

export async function fetchAdminStats(): Promise<AdminStats> {
  return axios.get('/admin/stats').then(r => r.data as AdminStats)
}

export async function fetchFDAPortals(): Promise<{ id: number; name: string }[]> {
  const result = await axios.get('/api/v2/admin/fda-space-group').then(r => r.data as SpaceGroup)
  if (!result) return []

  return result.spaces
}

export async function provisionUsers(ids: number[], spaceIds: number[]) {
  return axios.post('/api/v2/admin/users/provision', { ids, spaceIds }).then(r => r.data)
}

export const fetchInvitations = async (configs: AxiosRequestConfig) => {
  return axios.get<InvitationListType>('/api/v2/admin/invitations', configs).then(r => r.data)
}

export async function editInvitationBasicInfo(id: number, data: Partial<{ firstName: string; lastName: string; email: string }>) {
  return axios.put(`/api/v2/admin/invitations/${id}`, data).then(r => r.data)
}
