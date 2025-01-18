import React from 'react'
import { useAuthUser } from '../../auth/useAuthUser'
import PublicLayout from '../../../layouts/PublicLayout'
import { ChallengeDetails } from './ChallengeDetails'

export const ChallengeDetailsLayout = () => {
  const user = useAuthUser()
  return (
    <PublicLayout mainScroll={!!user}><ChallengeDetails /></PublicLayout>
  )
}
