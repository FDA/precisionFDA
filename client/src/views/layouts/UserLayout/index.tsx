import React, { FC } from 'react'
import styled from 'styled-components'

import { Header } from '../../../components/Header'
import { Loader } from '../../../components/Loader'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { useAuthUserQuery } from '../../../features/auth/useAuthUser'
import AlertNotifications from '../../components/AlertNotifications'

const StyledLayoutLoader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 64px;
`

const LayoutLoader = () => (
  <StyledLayoutLoader>
    <div>Loading your experince</div>
    <Loader />
  </StyledLayoutLoader>
)

export const UserLayout: FC = ({ children }) => {
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
    <div className="pfda-loader-wrapper">
      <Header />
      {content()}
      <AlertNotifications />
    </div>
  )
}
