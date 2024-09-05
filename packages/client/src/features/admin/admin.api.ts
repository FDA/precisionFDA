import axios from 'axios'

export interface AdminStats {
  usersCount: number
  orgsCount: number
}
export async function fetchAdminStats(): Promise<AdminStats> {
  return axios.get('/admin/stats').then(r => r.data as AdminStats)
}