import axios, { AxiosRequestConfig } from 'axios'

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

export async function fetchAdminStats(): Promise<AdminStats> {
  return axios.get('/admin/stats').then(r => r.data as AdminStats)
}

export async function provisionUsers(ids: number[]) {
  return axios.post('/api/v2/admin/users/provision', { ids }).then(r => r.data)
}

export const fetchInvitations = async (configs: AxiosRequestConfig) => {
  return axios.get<{ data: Invitation[] }>('/api/v2/admin/invitations', configs).then(r => r.data)
}
