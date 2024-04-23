import React, { ReactNode } from 'react'
import { LoaderWrapper } from '../../components/LoaderWrapper/LoaderWrapper'

const DefaultLayout = ({ children }: { children: ReactNode }) => (
  <LoaderWrapper>
    {children}
  </LoaderWrapper>
)

export default DefaultLayout
