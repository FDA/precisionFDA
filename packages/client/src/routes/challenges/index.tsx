import React from 'react'
import { Navigate, type RouteObject } from 'react-router'
import { LayoutLoader, UserLayout } from '@/layouts/UserLayout'

const ChallengesList = React.lazy(() => import('../../features/challenges/list/ChallengesList'))
const ProposeChallengePage = React.lazy(() => import('../../features/challenges/form/ProposeChallengePage'))
const ChallengeDetailsLayout = React.lazy(() => import('../../features/challenges/details/ChallengeDetailsLayout'))
const CreateChallengePage = React.lazy(() => import('../../features/challenges/form/CreateChallengePage'))
const EditChallengePage = React.lazy(() => import('../../features/challenges/form/EditChallengePage'))
const ContentEditorPage = React.lazy(() => import('../../features/challenges/content/ContentEditorPage'))
const ContentTypePage = React.lazy(() =>
  import('../../features/challenges/content/ContentTypePage').then(m => ({ default: m.ContentTypePage })),
)

const ContentEditorLayout = () => (
  <UserLayout innerScroll>
    <React.Suspense fallback={<LayoutLoader />}>
      <ContentEditorPage />
    </React.Suspense>
  </UserLayout>
)

const EditChallengeSettingsLayout = () => (
  <UserLayout>
    <EditChallengePage />
  </UserLayout>
)

const ChallengeContentInfoPage = () => <ContentTypePage contentType="info" />

const ChallengeContentResultsPage = () => <ContentTypePage contentType="results" />

const ChallengeContentPreRegistrationPage = () => <ContentTypePage contentType="pre-registration" />

const challengeContentEditorRoutes: RouteObject[] = [
  { index: true, element: <Navigate to="info" replace /> },
  { path: 'info', Component: ChallengeContentInfoPage },
  { path: 'results', Component: ChallengeContentResultsPage },
  { path: 'pre-registration', Component: ChallengeContentPreRegistrationPage },
]

export const publicChallengeRoutes: RouteObject[] = [
  { path: 'challenges', Component: ChallengesList },
  { path: 'challenges/propose', Component: ProposeChallengePage },
  { path: 'challenges/:challengeId/*', Component: ChallengeDetailsLayout },
]

export const protectedChallengeRoutes: RouteObject[] = [
  { path: 'challenges/create', Component: CreateChallengePage },
  {
    path: 'challenges/:challengeId/content',
    Component: ContentEditorLayout,
    children: challengeContentEditorRoutes,
  },
  {
    path: 'challenges/:challengeId/settings',
    Component: EditChallengeSettingsLayout,
  },
]
