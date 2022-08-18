import React from 'react'
import { Loader } from '../../../components/Loader'
import { useAuthUserQuery } from '../../../features/auth/useAuthUser'

export const LoaderWrapper: React.FC = ({ children }) => {
  const { isLoading } = useAuthUserQuery()
  if (isLoading) return <Loader />
  return children
}
