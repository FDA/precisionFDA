import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { Loader } from '@/components/Loader'
import { NotAllowedPage } from '@/components/NotAllowed'
import { useAuthUser } from '@/features/auth/useAuthUser'
import Logo from '../../components/Logo'
import { ErrorBoundary } from '@/utils/ErrorBoundry'
import { useScrollMode } from '@/hooks/useScrollMode'

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

export const UserLayout = ({
  children,
  mainScroll = false,
  innerScroll = false,
  scrollPaddingTop,
}: {
  children: ReactNode
  mainScroll?: boolean
  innerScroll?: boolean
  scrollPaddingTop?: string | number
}) => {
  const { user, loading } = useAuthUser(true)
  useScrollMode(mainScroll ? 'main' : innerScroll ? 'inner' : null)

  const content = () => {
    if (loading) return <LayoutLoader />
    if (user) return children
    return <NotAllowedPage info="401 Unauthorized" />
  }
  return (
    <main style={{ scrollPaddingTop }}>
      <ErrorBoundary>{content()}</ErrorBoundary>
    </main>
  )
}
