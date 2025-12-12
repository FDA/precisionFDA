import { QueryClientProvider } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import AuthWall from './AuthWall'
import Header from './components/Header/HeaderNext'
import { AlertDismissedProvider } from './features/admin/alerts/useAlertDismissedLocalStorage'
import { ExpiringSessionModal } from './features/auth/ExpiringSessionModal'
import { SessionExpiredModal } from './features/auth/SessionExpiredModal'
import { useModal } from './features/modal/useModal'
import { LayoutLoader, UserLayout } from './layouts/UserLayout'
import NoFoundPage from './pages/NoFoundPage'
import GlobalStyle from './styles/global'
import { PFDAToastContainer } from './utils/PFDAToastContainer'
import queryClient from './utils/queryClient'

import 'react-tooltip/dist/react-tooltip.css'
import RequestAccessPage from './features/request-access/RequestAccessPage'
import { ColorModeProvider } from './utils/ThemeContext'
import { spacesRoutes } from './features/spaces/routes'
import homeDetailRoutes from './features/home/show/routes'
import HomeShowLayout from './features/home/show/HomeShowLayout'
import { useNotificationCenter } from 'react-toastify/addons/use-notification-center'
import { initializeToastHelper } from './components/NotificationCenter/ToastHelper'

const DataPortalRoutes = React.lazy(() => import('./features/data-portals/routes'))
const ExpertsSinglePage = React.lazy(() => import('./features/experts/details/index'))
const EditChallengePage = React.lazy(() => import('./features/challenges/form/EditChallengePage'))
const ChallengeDetailsLayout = React.lazy(() => import('./features/challenges/details/ChallengeDetailsLayout'))
const ContentEditorPage = React.lazy(() => import('./features/challenges/content/ContentEditorPage'))
const PublishingPage = React.lazy(() => import('./features/publishing/PublishingPage'))
const TrackPage = React.lazy(() => import('./features/tracks/TrackPage'))
const Admin = React.lazy(() => import('./features/admin'))
const ChallengesList = React.lazy(() => import('./features/challenges/list/ChallengesList'))
const CreateChallengePage = React.lazy(() => import('./features/challenges/form/CreateChallengePage'))
const ProposeChallengePage = React.lazy(() => import('./features/challenges/form/ProposeChallengePage'))
const NewsListPage = React.lazy(() => import('./features/news/NewsPage'))
const CreateNewsItemPage = React.lazy(() => import('./features/news/form/CreateNewsItemPage'))
const LandingPage = React.lazy(() => import('./features/overview/OverviewPage'))
const AboutPage = React.lazy(() => import('./pages/AboutPage'))
const NotificationsPage = React.lazy(() => import('./pages/Account/Notifications'))
const ExpertsListPage = React.lazy(() => import('./features/experts/ExpertsList'))
const WorkflowRunPage = React.lazy(() => import('./features/workflows/run/RunWorkflowForm'))
const EditNewsItemPage = React.lazy(() => import('./features/news/form/EditNewsItemPage'))
const ListAdminNews = React.lazy(() => import('./features/news/ListAdminNews'))

const ToS = React.lazy(() => import('./pages/ToS'))
const Security = React.lazy(() => import('./pages/Security'))

const RootComponent = () => {
  const sessionExpiredModal = useModal()
  const expiringSessionModal = useModal()
  const [railsAlertHeight, setRailsAlertHeight] = useState(0)
  const { markAsRead } = useNotificationCenter()

  useEffect(() => {
    // Calculate the height of the rails-alert element
    const alertElement = document.querySelector('.rails-alert')
    if (alertElement) {
      setRailsAlertHeight(alertElement.clientHeight as number)
    }
    initializeToastHelper(markAsRead)
  }, [markAsRead])

  return (
    <ColorModeProvider>
      <React.Fragment>
        <GlobalStyle railsAlertHeight={railsAlertHeight} />
        <QueryClientProvider
          client={queryClient({
            onAuthFailure: () => sessionExpiredModal.setShowModal(true),
          })}
        >
          <AlertDismissedProvider>
            <Header />
            <React.Suspense fallback={<LayoutLoader />}>
              <Outlet />
            </React.Suspense>
            <PFDAToastContainer />
            <SessionExpiredModal {...sessionExpiredModal} />
            <ExpiringSessionModal modal={expiringSessionModal} />
          </AlertDismissedProvider>
        </QueryClientProvider>
      </React.Fragment>
    </ColorModeProvider>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootComponent />,
    children: [
      // Unprotected routes
      { index: true, element: <LandingPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'challenges', element: <ChallengesList /> },
      { path: 'challenges/propose', element: <ProposeChallengePage /> },
      { path: 'challenges/:challengeId/*', element: <ChallengeDetailsLayout /> },
      { path: 'news', element: <NewsListPage /> },
      { path: 'experts/:expertId/*', element: <ExpertsSinglePage /> },
      { path: 'experts', element: <ExpertsListPage /> },
      { path: 'terms', element: <ToS /> },
      // keep the snake case route for old content in Rails
      { path: '/request_access', element: <RequestAccessPage /> },
      { path: 'security', element: <Security /> },
      { path: 'daaas', element: <Navigate to="/data-portals/main" replace /> },
      { path: '*', element: <NoFoundPage /> },

      // Protected routes
      {
        element: <AuthWall />,
        children: [
          { path: 'admin/*', element: <Admin /> },
          { path: 'challenges/create', element: <CreateChallengePage /> },
          { path: 'challenges/:challengeId/content', element: <Navigate to="info" replace /> },
          {
            path: 'challenges/:challengeId/content/*',
            element: (
              <UserLayout innerScroll>
                <ContentEditorPage />
              </UserLayout>
            ),
          },
          {
            path: 'challenges/:challengeId/settings',
            element: (
              <UserLayout>
                <EditChallengePage />
              </UserLayout>
            ),
          },
          {
            path: 'home/*',
            element: <HomeShowLayout />,
            children: homeDetailRoutes,
          },
          { path: 'account/notifications', element: <NotificationsPage /> },
          {
            path: 'spaces/*',
            children: spacesRoutes,
          },
          { path: 'publish/*', element: <PublishingPage /> },
          { path: 'workflows/:workflowUid/analyses/new', element: <WorkflowRunPage /> },
          { path: 'admin/news', element: <ListAdminNews /> },
          { path: 'admin/news/create', element: <CreateNewsItemPage /> },
          { path: 'admin/news/:id/edit', element: <EditNewsItemPage /> },
          { path: 'comparisons/:identifier/track', element: <TrackPage /> },
          { path: 'notes/:identifier/track', element: <TrackPage /> },
          { path: 'data-portals/*', element: <DataPortalRoutes /> },
        ],
      },
    ],
  },
])

const root = () => {
  return <RouterProvider router={router} />
}

root.displayName = 'Root'

export default root
