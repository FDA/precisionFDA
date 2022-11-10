import React, { FC } from 'react'

import AlertNotifications from '../../components/AlertNotifications'
import { LoaderWrapper } from '../../components/LoaderWrapper/LoaderWrapper'
import PFDAFooter from '../../components/Footer'


const PublicLayout: FC = ({ children }) =>
  <LoaderWrapper>
    <>
      {children}
      <AlertNotifications />
      <PFDAFooter />
    </>
  </LoaderWrapper>

export default PublicLayout
