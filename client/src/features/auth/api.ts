import axios from 'axios'
import { IUser } from '../../types/user'
import { backendCall } from '../../utils/api'

export const fetchCurrentUser = async (): Promise<IUser> => {
  const res = await backendCall('/api/user', 'GET')
  return res?.payload.user
}

export const logout = async (): Promise<any> => {
  await backendCall('/logout', 'DELETE')
}

export type CDMHKey = 'cdmhPortal' | 'cdrBrowser' | 'cdrAdmin' | 'connectPortal'

export interface SiteSettingsResponse {
  isEnabled: boolean,
  data: Record<CDMHKey, string>
}

export async function siteSettingsRequest() {
  return axios.get('/api/site_settings/cdmh').then(r => r.data as SiteSettingsResponse)
}

interface GenerateKeyResponse {
  Key: string
}

export async function generateKeyRequest() {
  return axios.get('/api/auth_key').then(r => r.data as GenerateKeyResponse)
}
