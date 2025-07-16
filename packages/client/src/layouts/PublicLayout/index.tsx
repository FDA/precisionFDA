import React, { ReactNode } from 'react'
import PFDAFooter from '../../components/Footer'
import { ScrollableInnerGlobalStyles, ScrollableMainGlobalStyles } from '../../styles/global'


const PublicLayout = ({ children, mainScroll = false, innerScroll = false, showFooter = true, scrollPaddingTop }: { children: ReactNode, mainScroll?: boolean, innerScroll?: boolean, showFooter?: boolean, scrollPaddingTop?: string|number }) =>
  <>
  {mainScroll && <ScrollableMainGlobalStyles />}
  {innerScroll && <ScrollableInnerGlobalStyles />}
  <main style={{ scrollPaddingTop }}>
    {children}
    {showFooter && <PFDAFooter />}
  </main>
  </>

export default PublicLayout
