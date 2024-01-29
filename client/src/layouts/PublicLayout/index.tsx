import React, { ReactNode } from 'react'
import PFDAFooter from '../../components/Footer'


const PublicLayout = ({ children }: { children: ReactNode }) =>
  <main>
    {children}
    <PFDAFooter />
  </main>

export const DocsLayout = ({ children }: { children: ReactNode }) =>
  <main>
    {children}
  </main>

export default PublicLayout
