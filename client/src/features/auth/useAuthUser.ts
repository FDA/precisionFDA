import { IUser } from '../../types/user'
import { useAuthUserQuery } from './api'


export function useAuthUser(): IUser | undefined {
  const { data } = useAuthUserQuery()
  const user: Partial<IUser> = {}

  const emailDomain = data?.user?.email?.split('@').pop()
  user.isGovUser = emailDomain?.endsWith('fda.hhs.gov') || false
  user.isAdmin = data?.user?.can_administer_site || false
  return data?.user === undefined ? undefined : ({ ...data.user, ...user, session_id: data?.meta.session_id })
}
