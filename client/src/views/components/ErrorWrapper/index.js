import React from 'react'
import { useSelector } from 'react-redux'

import { errorPageSelector } from './selectors'
import { ERROR_PAGES } from '../../../constants'
import NoFoundPage from '../../pages/NoFoundPage'
import SpaceLockedPage from '../../pages/SpaceLockedPage'


const ErrorWrapper = ({ children }) => {
  const errorPage = useSelector(errorPageSelector)

  if (errorPage === ERROR_PAGES.NOT_FOUND) {
    return <NoFoundPage />
  } else if (errorPage === ERROR_PAGES.LOCKED_SPACE) {
    return <SpaceLockedPage />
  }

  return children
}

export default ErrorWrapper
