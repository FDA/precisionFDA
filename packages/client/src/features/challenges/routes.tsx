import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthUser } from '../auth/useAuthUser'
import { UserLayout } from '../../layouts/UserLayout'
import ChallengeSubmit from './submit/ChallengeSubmitPage'
import EditChallengePage from './form/EditChallengePage'
import ContentEditorPage from './content/ContentEditorPage'
import PublicLayout from '../../layouts/PublicLayout'
import { ChallengeDetails } from './details/ChallengeDetails'

const ChallengeRoutes = () => {
  const user = useAuthUser()

  return (
    <Routes>
      <Route
        path="/content/*"
        element={
          <UserLayout innerScroll>
            <ContentEditorPage />
          </UserLayout>
        }
      />
      <Route path="/content" element={<Navigate to="info" replace />} />
      <Route
        path="/settings"
        element={
          <UserLayout>
            <EditChallengePage />
          </UserLayout>
        }
      />
      <Route
        path="/*"
        element={
          <PublicLayout mainScroll={!!user}>
            <ChallengeDetails />
          </PublicLayout>
        }
      />
    </Routes>
  )
}

export default ChallengeRoutes
