import React, { FC } from 'react'
import { LoaderWrapper } from '../../components/LoaderWrapper/LoaderWrapper'
import PFDAFooter from '../../components/Footer'


const PublicLayout: FC = ({ children }) =>
  <LoaderWrapper>
    <>
      {children}
      <PFDAFooter />
    </>
  </LoaderWrapper>

export default PublicLayout
