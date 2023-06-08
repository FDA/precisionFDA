import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { IUser } from '../../types/user'
import { backendCall } from '../../utils/api'

export function useAuthUserQuery() {
  return useQuery(['auth-user'], {
    queryFn: () => axios.get('/api/user').then(r => r.data as { user: IUser, meta: any }),
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 1,
  })
}

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
