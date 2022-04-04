import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import fetchContext from '../../../actions/context'
import { RootState } from '../../../store'

export const LoaderWrapper: React.FC = ({ children }) => {
  const dispatch = useDispatch()
  const context = useSelector((state: RootState) => state.context)
  useEffect(() => {
    if (!context.isInitialized) {
      dispatch(fetchContext())
    }
  }, [])

  if (!context.isFetching) {
    return <>{children}</>
  }
  return <div>Loading...</div>
}
