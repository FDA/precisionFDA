import React from 'react'
import { NotAllowedPage } from '../../components/NotAllowed'
import { useAuthUser } from '../auth/useAuthUser'

export const AdminWrapper = ({ children }: { children: any }) => {
  const user = useAuthUser()
  if(!user) return <></>
  return (
    <>
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      {user?.can_administer_site ? <>{children}</> : <NotAllowedPage />}
    </>
  )
}
