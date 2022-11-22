import React, { ReactNode } from 'react'
import { Header } from '../../../components/Header'
import { LoaderWrapper } from '../../components/LoaderWrapper/LoaderWrapper'

const DefaultLayout = ({ children }: { children: ReactNode }) => (
  <LoaderWrapper>
    <Header />
    {children}
  </LoaderWrapper>
)

export default DefaultLayout
