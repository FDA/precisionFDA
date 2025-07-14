import { useQuery } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { IUser } from '../../types/user'
import { SiteSettingsResponse } from './useSiteSettingsQuery'
import { ApiErrorResponse, IMeta } from '../home/types'

export function useAuthUserQuery() {
  return useQuery<{ user: IUser; meta: IMeta }, AxiosError<ApiErrorResponse>>({
    queryKey: ['auth-user'],
    queryFn: () => axios.get('/api/user').then(r => r.data),
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
  return axios.get<SiteSettingsResponse>('/api/v2/site-settings').then(r => r.data)
}

interface GenerateKeyResponse {
  Key: string
}

export async function generateKeyRequest() {
  return axios.get('/api/auth_key').then(r => r.data as GenerateKeyResponse)
}
