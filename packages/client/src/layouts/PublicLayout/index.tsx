import React, { ReactNode } from 'react'
import styled from 'styled-components'
import PFDAFooter from '../../components/Footer'
import { ScrollableInnerGlobalStyles, ScrollableMainGlobalStyles } from '../../styles/global'

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
}) => (
  <>
    {mainScroll && <ScrollableMainGlobalStyles />}
    {innerScroll && <ScrollableInnerGlobalStyles />}
    <PublicLayoutMain style={{ scrollPaddingTop }}>
      {children}
      {showFooter && <PFDAFooter />}
    </PublicLayoutMain>
  </>
)

export default PublicLayout
