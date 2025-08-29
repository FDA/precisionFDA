import axios, { AxiosRequestConfig } from 'axios'
import { User } from './types'
import { InvitationListType } from '../invitations/types'

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

export async function bulkEnableResource(ids: number[], resource: User['cloudResourceSettings']['resources'][number]) {
  return await axios.put('/api/v2/admin/users/enable-resource', { ids, resource }).then(res => res.data)
}

export async function bulkEnableAllResources(ids: number[]) {
  return await axios.put('/api/v2/admin/users/enable-all-resources', { ids }).then(res => res.data)
}

export async function bulkDisableResource(ids: number[], resource: User['cloudResourceSettings']['resources'][number]) {
  return await axios.put('/api/v2/admin/users/disable-resource', { ids, resource }).then(r => r.data)
}

export async function bulkDisableAllResources(ids: number[]) {
  return await axios.put('/api/v2/admin/users/disable-all-resources', { ids }).then(r => r.data)
}

export async function fetchAdminStats(): Promise<AdminStats> {
  return axios.get('/api/v2/admin/stats').then(r => r.data as AdminStats)
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

export async function setTotalLimit(ids: User['id'][], limit: number) {
  return axios.put('/api/v2/admin/users/set-total-limit', { ids, limit }).then(res => res.data)
}

export const setJobLimit = async (ids: User['id'][], limit: number) =>
  axios
    .put('/api/v2/admin/users/set-job-limit', {
      ids,
      limit,
    })
    .then(res => res.data)

export const bulkUnlock = async (ids: User['id'][]) =>
  axios
    .post('/api/v2/admin/users/unlock', {
      ids,
    })
    .then(res => res.data)

export const bulkActivate = async (ids: User['id'][]) =>
  axios
    .put('/api/v2/admin/users/activate', {
      ids,
    })
    .then(res => res.data)

export const bulkDeactivate = async (ids: User['id'][]) =>
  axios
    .put('/api/v2/admin/users/deactivate', {
      ids,
    })
    .then(res => res.data)
