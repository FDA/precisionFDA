import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { NotAllowedPage } from '../../components/NotAllowed'
import { useAuthUserQuery } from '../../features/auth/api'
import Logo from '../../components/Logo'
import { ErrorBoundary } from '../../utils/ErrorBoundry'
import { useScrollMode } from '../../hooks/useScrollMode'

const StyledLayoutLoader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 64px;
  color: var(--base);
`

export const LayoutLoader = () => (
  <StyledLayoutLoader>
    <Logo />
    <br />
    <Loader className="pageloader" />
  </StyledLayoutLoader>
)

export const UserLayout = ({ children, mainScroll = false, innerScroll = false, scrollPaddingTop }: { children: ReactNode, mainScroll?: boolean, innerScroll?: boolean, scrollPaddingTop?: string|number }) => {
  const user = useAuthUserQuery()
  useScrollMode(mainScroll ? 'main' : innerScroll ? 'inner' : null)

  const content = () => {
    if (user.isLoading) return <LayoutLoader />
    if (user.isSuccess) return children
    if (user.error) {
      if (user.error?.response?.status === 401)
        return <NotAllowedPage info="401 Unauthorized" />
        // @ts-expect-error unknonwn type
        if (user.error?.response?.data?.failure)
          // @ts-expect-error unknonwn type
        return user.error.response.data.failure
    }
    return children
  }
  return (
    <main style={{ scrollPaddingTop }}>
      <ErrorBoundary>
        {content()}
      </ErrorBoundary>
    </main>
  )
}
