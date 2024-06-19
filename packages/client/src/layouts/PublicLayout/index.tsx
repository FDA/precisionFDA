import React, { ReactNode } from 'react'
import PFDAFooter from '../../components/Footer'
import { ScrollableInnerGlobalStyles, ScrollableMainGlobalStyles } from '../../styles/global'


const PublicLayout = ({ children, mainScroll = false, innerScroll = false, showFooter = true }: { children: ReactNode, mainScroll?: boolean, innerScroll?: boolean, showFooter?: boolean }) =>
  <>
  {mainScroll && <ScrollableMainGlobalStyles />}
  {innerScroll && <ScrollableInnerGlobalStyles />}
  <main>
    {children}
    {showFooter && <PFDAFooter />}
  </main>
  </>

export const DocsLayout = ({ children }: { children: ReactNode }) =>
  <main>
    {children}
  </main>

export default PublicLayout
