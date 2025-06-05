import axios from 'axios'

export interface AdminStats {
  usersCount: number
  orgsCount: number
}

export async function fetchAdminStats(): Promise<AdminStats> {
  return axios.get('/admin/stats').then(r => r.data as AdminStats)
}

export async function provisionUsers(ids: number[]) {
  return axios.post('/api/v2/admin/users/provision', { ids }).then(r => r.data)
}
