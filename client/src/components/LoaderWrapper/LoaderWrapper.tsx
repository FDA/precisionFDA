/* eslint-disable react/jsx-no-useless-fragment */
import React, { ReactNode } from 'react'
import { Loader } from '../Loader'
import { useAuthUserQuery } from '../../features/auth/api'

export const LoaderWrapper = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useAuthUserQuery()
  if (isLoading) return <Loader />
  return <>{children}</>
}
