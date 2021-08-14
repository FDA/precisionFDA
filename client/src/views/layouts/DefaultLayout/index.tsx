import React from 'react'

import AlertNotifications from '../../components/AlertNotifications'
import LoaderWrapper from '../../components/LoaderWrapper'
import { Header } from '../../../components/Header'
import { FC } from 'react'


const DefaultLayout: FC = ({ children }) =>
  <LoaderWrapper>
    <>
      <Header />
      {children}
      <AlertNotifications />
    </>
  </LoaderWrapper>

export default DefaultLayout
