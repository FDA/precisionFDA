import React, { FC } from 'react'

import AlertNotifications from '../../components/AlertNotifications'
import LoaderWrapper from '../../components/LoaderWrapper'
import PFDAFooter from '../../components/Footer'
import { Header } from '../../../components/Header'


const PublicLayout: FC = ({ children }) =>
  <LoaderWrapper>
    <>
      <Header />
      {children}
      <AlertNotifications />
      <PFDAFooter />
    </>
  </LoaderWrapper>

export default PublicLayout
