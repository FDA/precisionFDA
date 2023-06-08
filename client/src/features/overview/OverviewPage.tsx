import React from 'react'
import { useAuthUser } from '../auth/useAuthUser'
import { OverviewPublic } from './OverviewPublic'
import { OverviewAuthed } from './OverviewAuthed'

const OverviewPage = () => {
  const user = useAuthUser()
  
  if (!user) {
    return <OverviewPublic />
  }
  return <OverviewAuthed />
}

export default OverviewPage
