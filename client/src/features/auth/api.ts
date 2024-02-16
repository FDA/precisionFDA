import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { IUser } from '../../types/user'
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

export function logout() {
  return axios.delete('/logout')
}

export type CDMHKey = 'cdmhPortal' | 'cdrBrowser' | 'cdrAdmin' | 'connectPortal'

export async function siteSettingsRequest() {
  return axios.get<SiteSettingsResponse>('/api/site_settings').then(r => r.data)
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
