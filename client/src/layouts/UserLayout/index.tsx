import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { NotAllowedPage } from '../../components/NotAllowed'
import { useAuthUserQuery } from '../../features/auth/api'
import { PFDALogoDark } from '../../components/NavigationBar/PFDALogo'

const StyledLayoutLoader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 64px;
`

export const LayoutLoader = () => (
  <StyledLayoutLoader>
    <PFDALogoDark style={{ height: 40 }} />
    <br />
    <Loader className="pageloader" />
  </StyledLayoutLoader>
)

export const UserLayout = ({ children }: { children: ReactNode }) => {
  const user = useAuthUserQuery()

  const content = () => {
    if (user.isLoading) return <LayoutLoader />
    if (user.isSuccess) return children
    if (user.error) {
      if (user.error?.response?.status === 401)
        return <NotAllowedPage info="401 Unauthorized" />
      if (user.error?.response?.data?.failure)
        return user.error.response.data.failure
    }
    return children
  }
  return (
    <main className="pfda-loader-wrapper">
      {content()}
    </main>
  )
}
