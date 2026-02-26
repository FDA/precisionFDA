import { useQuery, UseQueryResult } from '@tanstack/react-query'
import axios from 'axios'
import { IUser } from '@/types/user'
import { getCookie } from '@/utils/cookies'
import { SiteSettingsResponse } from './useSiteSettingsQuery'

/**
 * Do not use directly - use the `useAuthUser` hook from './useAuthUser' instead.
 *
 * The query is gated by the `sessionExpiredAt` cookie. If it is absent, the user
 * has no active session and the /api/user request would certainly fail, so we skip
 * it entirely. We cannot check the actual session cookie (`_precision-fda_session`)
 * because it is set with httpOnly and secure flags, making it inaccessible from
 * client-side JavaScript.
 */
export function useAuthUserQuery(): UseQueryResult<{ user: IUser; meta: any }, Error> {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async (): Promise<{ user: IUser; meta: any }> => {
      const response = await axios.get('/api/user')
      return response.data
    },
    enabled: !!getCookie('sessionExpiredAt'),
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
  return axios.get<SiteSettingsResponse>('/api/v2/site-settings').then(r => r.data)
}

interface GenerateKeyResponse {
  Key: string
}

export async function generateKeyRequest() {
  return axios.get('/api/auth_key').then(r => r.data as GenerateKeyResponse)
}
