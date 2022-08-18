import React, { FC } from 'react'

import { Header } from '../../../components/Header'
import AlertNotifications from '../../components/AlertNotifications'
import LoaderWrapper from '../../components/LoaderWrapper'

const DefaultLayout: FC = ({ children }) => (
  <LoaderWrapper>
    <>
      <Header />
      {children}
      <AlertNotifications />
    </>
  </LoaderWrapper>
)

export default DefaultLayout
