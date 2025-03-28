import React from 'react'
import { NotAllowedPage } from '../../components/NotAllowed'
import { useAuthUser } from '../auth/useAuthUser'

export const AdminWrapper = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthUser()
  if(!user) return <></>
  return (
    <>
      {user?.can_administer_site ? <>{children}</> : <NotAllowedPage />}
    </>
  )
}
