import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { AdminUserDetailsContent } from '../admin/users/AdminUserDetailsDrawer'
import { fetchAdminUserByDxuser } from '../admin/users/api'
import { useAuthUser } from '../auth/useAuthUser'
import { fetchUserByDxuser } from './api'
import { UserBasicContent } from './UserDetailsDrawer'

const UserDetailsForAdmin = ({ dxuser }: { dxuser: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-user-details', dxuser],
    queryFn: () => fetchAdminUserByDxuser(dxuser ?? ''),
    enabled: dxuser != null,
    refetchOnWindowFocus: false,
  })

  return (
    <>
      {isLoading ? <div className="px-5 py-4 text-sm text-(--c-text-400)">Loading…</div> : null}
      {!isLoading && error ? (
        <div className="px-5 py-4 text-sm text-(--warning-600)">Failed to load user details.</div>
      ) : null}
      {!isLoading && !error && data ? <AdminUserDetailsContent details={data} /> : null}
    </>
  )
}

const UserDetailsBasic = ({ dxuser }: { dxuser: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-details', dxuser],
    queryFn: () => fetchUserByDxuser(dxuser ?? ''),
    enabled: dxuser != null,
    refetchOnWindowFocus: false,
  })

  return (
    <>
      {isLoading ? <div className="px-5 py-4 text-sm text-(--c-text-400)">Loading…</div> : null}
      {!isLoading && error ? (
        <div className="px-5 py-4 text-sm text-(--warning-600)">Failed to load user details.</div>
      ) : null}
      {!isLoading && !error && data ? <UserBasicContent user={data} /> : null}
    </>
  )
}

export const UserDetailsPage = () => {
  const { dxuser } = useParams<{ dxuser: string }>()
  const currentUser = useAuthUser()

  if (!dxuser) return <div className="px-8 py-6 text-sm text-(--warning-600)">User not found.</div>

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-sm sm:max-w-2xl lg:max-w-4xl">
        {currentUser?.isAdmin ? <UserDetailsForAdmin dxuser={dxuser} /> : <UserDetailsBasic dxuser={dxuser} />}
      </div>
    </div>
  )
}
