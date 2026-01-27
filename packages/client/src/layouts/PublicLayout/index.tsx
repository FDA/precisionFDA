import React, { ReactNode } from 'react'
import styled from 'styled-components'
import PFDAFooter from '../../components/Footer'
import { useScrollMode } from '../../hooks/useScrollMode'

const PublicLayoutMain = styled.main`
  min-height: 100vh;
`

const PublicLayout = ({
  children,
  mainScroll = false,
  innerScroll = false,
  showFooter = true,
  scrollPaddingTop,
}: {
  children: ReactNode
  mainScroll?: boolean
  innerScroll?: boolean
  showFooter?: boolean
  scrollPaddingTop?: string | number
}) => {
  useScrollMode(mainScroll ? 'main' : innerScroll ? 'inner' : null)
  
  return (
    <PublicLayoutMain style={{ scrollPaddingTop }}>
      {children}
      {showFooter && <PFDAFooter />}
    </PublicLayoutMain>
  )
}

export default PublicLayout
