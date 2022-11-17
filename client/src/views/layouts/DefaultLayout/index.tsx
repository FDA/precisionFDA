import React, { FC } from 'react'
import { Header } from '../../../components/Header'
import { LoaderWrapper } from '../../components/LoaderWrapper/LoaderWrapper'

const DefaultLayout: FC = ({ children }) => (
  <LoaderWrapper>
    <>
      <Header />
      {children}
    </>
  </LoaderWrapper>
)

export default DefaultLayout
