import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { IUser } from '../../types/user'
import { backendCall } from '../../utils/api'
import { SiteSettingsResponse } from './useSiteSettingsQuery'
import { CustomPortal } from './useCustomPortalsQuery'

export function useAuthUserQuery() {
  return useQuery({
    queryKey: ['auth-user'],

    queryFn: () => axios.get('/api/user').then(r => {
      return r.data as { user: IUser, meta: any }
    }),
    staleTime: Infinity,
    gcTime: Infinity,
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

export async function siteSettingsRequest() {
  return axios.get('/api/site_settings').then(r => r.data as SiteSettingsResponse)
}

export async function customPortalsRequest() {
  return axios.get('/api/data_portals/custom').then(r => r.data as CustomPortal[])
}

interface GenerateKeyResponse {
  Key: string
}

export async function generateKeyRequest() {
  return axios.get('/api/auth_key').then(r => r.data as GenerateKeyResponse)
}
