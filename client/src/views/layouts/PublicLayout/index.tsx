import React, { ReactNode } from 'react'
import PFDAFooter from '../../components/Footer'


const PublicLayout = ({ children }: { children: ReactNode }) =>
  <>
    {children}
    <PFDAFooter />
  </>

export default PublicLayout
