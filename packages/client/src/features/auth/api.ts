import { useQuery, UseQueryResult } from '@tanstack/react-query'
import axios from 'axios'
import { IUser } from '@/types/user'
import { SiteSettingsResponse } from './useSiteSettingsQuery'

export function useAuthUserQuery(): UseQueryResult<{ user: IUser; meta: any }, Error> {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async (): Promise<{ user: IUser; meta: any }> => {
      const response = await axios.get('/api/user')
      return response.data
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: (failureCount, error) => {
      // Only retry on network errors, not auth errors
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false
      }
      return failureCount < 1
    },
    retryOnMount: false,
  })
}

export function logout() {
  return axios.delete('/logout')
}

export type CDMHKey = 'cdmhPortal' | 'cdrBrowser' | 'cdrAdmin' | 'connectPortal'

export async function siteSettingsRequest() {
  return axios.get<SiteSettingsResponse>('/api/v2/site-settings').then((r) => r.data)
}

interface GenerateKeyResponse {
  Key: string
}

export async function generateKeyRequest() {
  return axios.get('/api/auth_key').then((r) => r.data as GenerateKeyResponse)
}
