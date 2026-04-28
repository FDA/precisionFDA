import axios from 'axios'
import type {
  OrgUsersListResponse,
  ProfilePageData,
  ProfileViewFields,
  UpdateProfilePayload,
  UpdateTimeZonePayload,
} from './profile.types'

const API_BASE = '/api/v2/profile'

export async function fetchProfilePage(): Promise<ProfilePageData> {
  const response = await axios.get<ProfilePageData>(API_BASE)
  return response.data
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<ProfileViewFields> {
  const response = await axios.put<ProfileViewFields>(API_BASE, payload)
  return response.data
}

export async function fetchOrganizationUsers(): Promise<OrgUsersListResponse> {
  const response = await axios.get<OrgUsersListResponse>(`${API_BASE}/organization/users`)
  return response.data
}

export async function updateTimeZone(payload: UpdateTimeZonePayload): Promise<void> {
  await axios.put(`${API_BASE}/time-zone`, payload)
}

export async function updateOrganizationName(name: string): Promise<{ name: string }> {
  const response = await axios.put<{ name: string }>(`${API_BASE}/organization`, { name })
  return response.data
}

export async function deactivateOrgUser(userId: number): Promise<void> {
  await axios.patch(`${API_BASE}/organization/users/${userId}`, { active: false })
}

export async function removeOrgMember(userId: number): Promise<void> {
  await axios.delete(`${API_BASE}/organization/users/${userId}`)
}
