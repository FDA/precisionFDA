import axios from 'axios'
import type { IFilter } from '../../home/types'
import { type Params, prepareListFetchV2 } from '../../home/utils'
import type { AdminRole, UserWithAdminRolesListType } from './types'

export async function fetchUsersWithRoles(filters: IFilter[], params: Params): Promise<UserWithAdminRolesListType> {
  const query = prepareListFetchV2(filters, params)
  const paramQ = `?${new URLSearchParams(query).toString()}`
  return axios.get<UserWithAdminRolesListType>(`/api/v2/admin/memberships/users${paramQ}`).then(r => r.data)
}

export async function createAdminMembership(userId: number, group: AdminRole): Promise<{ id: number }> {
  return axios.post<{ id: number }>('/api/v2/admin/memberships', { userId, group }).then(r => r.data)
}

export async function deleteAdminMembership(id: number): Promise<void> {
  return axios.delete(`/api/v2/admin/memberships/${id}`).then(() => undefined)
}
