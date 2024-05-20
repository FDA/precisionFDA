import { IUser } from '../../types/user'
import { useAuthUserQuery } from './api'

export function useAuthUser(withLoading: true): { user: IUser | undefined; loading: boolean }
export function useAuthUser(withLoading: false): IUser | undefined
export function useAuthUser(): IUser | undefined
export function useAuthUser(withLoading = false): { user: IUser | undefined; loading: boolean } | (IUser | undefined) {
  const { data, isLoading } = useAuthUserQuery()
  const user: Partial<IUser> = {}

  const emailDomain = data?.user?.email?.split('@').pop()
  user.isGovUser = ['fda.hhs.gov','fda.gov'].includes(emailDomain ?? '')
  user.isAdmin = data?.user?.can_administer_site || false

  if (withLoading) {
    return {
      user: data?.user === undefined ? undefined : { ...data.user, ...user, session_id: data.meta.session_id },
      loading: isLoading,
    }
  } else {
    return data?.user === undefined ? undefined : { ...data.user, ...user, session_id: data.meta.session_id }
  }
}
