import axios, { type AxiosRequestConfig } from 'axios'
import type { AdminUserDetails, AdminUserListType, User } from './types'
import type { InvitationListType } from '../invitations/types'
import type { IFilter } from '../../home/types'
import { type Params, prepareListFetchV2 } from '../../home/utils'

interface CountStats {
  total: number
  lastMonth: number
  lastSixMonths: number
  yearToDate: number
  lastYear: number
}

export interface AdminStats {
  usersCount: CountStats
  orgsCount: number
  spacesCount: CountStats
  filesCount: CountStats
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
  return axios.put('/api/v2/admin/users/total-limit', { ids, limit }).then(res => res.data)
}

export const setJobLimit = async (ids: User['id'][], limit: number) =>
  axios
    .put('/api/v2/admin/users/job-limit', {
      ids,
      limit,
    })
    .then(res => res.data)

export const userResetMfa = async (id: User['id']) => axios.post(`/api/v2/admin/users/${id}/resetMfa`).then(res => res.data)

export const userUnlock = async (id: User['id']) => axios.post(`/api/v2/admin/users/${id}/unlock`).then(res => res.data)

export const userResendActivationEmail = async (id: User['id']) =>
  axios.post(`/api/v2/admin/users/${id}/resend-activation-email`).then(res => res.data)

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

export async function fetchAdminUserDetails(id: User['id']) {
  return await axios.get<AdminUserDetails>(`/api/v2/admin/users/${id}`).then(r => r.data)
}

export async function fetchUsers(filters: IFilter[], params: Params) {
  const query = prepareListFetchV2(filters, params)
  const paramQ = `?${new URLSearchParams(query).toString()}`
  return axios.get<AdminUserListType>(`/api/v2/admin/users/${paramQ}`).then(r => r.data)
}
