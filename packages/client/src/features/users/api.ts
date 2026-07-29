import axios from 'axios'
import type { UserDetails } from './types'

export async function fetchUserById(id: number) {
  return await axios.get<UserDetails>(`/api/v2/users/${id}`).then(r => r.data)
}

export async function fetchUserByDxuser(dxuser: string) {
  return await axios.get<UserDetails>(`/api/v2/users/username/${encodeURIComponent(String(dxuser))}`).then(r => r.data)
}
