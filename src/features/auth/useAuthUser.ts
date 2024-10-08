import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { IUser } from '../../types/user'

export function useAuthUserQuery() {
  return useQuery(['auth-user'], {
    queryFn: () => axios.get('/api/user').then(r => r.data as { user: IUser }),
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 1,
  })
}

export function useAuthUser(): IUser | undefined {
  const { data } = useAuthUserQuery()
  const user: Partial<IUser> = {}
  user.isGovUser = data?.user?.email?.includes('fda.hhs.gov') || false
  user.isAdmin = data?.user?.can_administer_site || false
  return data?.user === undefined ? undefined : ({ ...data.user, ...user })
}
