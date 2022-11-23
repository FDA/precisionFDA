import React from 'react'
import { useAuthUser } from '../auth/useAuthUser'
import { OverviewPublic } from './OverviewPublic'
import { OverviewAuthed } from './OverviewAuthed'

const OverviewPage = () => {
  const user = useAuthUser()
  const isLoggedIn = user && Object.keys(user).length > 0
  if (isLoggedIn) {
    return <OverviewAuthed />
  }
  return <OverviewPublic />
}

export default OverviewPage
