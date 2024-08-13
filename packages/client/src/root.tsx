/* eslint-disable react/jsx-fragments */
import { QueryClientProvider } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Slide, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'
import Header from './components/Header/HeaderNext'
import { NavFavoritesProvider } from './components/Header/useNavFavoritesLocalStorage'
import { NavOrderProvider } from './components/Header/useNavOrderLocalStorage'
import { AlertDismissedProvider } from './features/admin/alerts/useAlertDismissedLocalStorage'
import { AuthModal } from './features/auth/AuthModal'
import { ExpiringSessionModal } from './features/auth/ExpiringSessionModal'
import DataPortalRoutes from './features/data-portals/routes'
import ExpertsSinglePage from './features/experts/details/index'
import { useModal } from './features/modal/useModal'
import { LayoutLoader } from './layouts/UserLayout'
import NoFoundPage from './pages/NoFoundPage'
import GlobalStyle from './styles/global'
import { ThemeProvider } from './utils/ThemeContext'
import queryClient from './utils/queryClient'
import { TrackPage } from './features/tracks/TrackPage'

import 'react-tooltip/dist/react-tooltip.css'

const Admin = React.lazy(() => import('./features/admin'))
const Home2 = React.lazy(() => import('./features/home'))
const Docs = React.lazy(() => import('./features/docs'))
const ChallengesList = React.lazy(() => import('./features/challenges/list/ChallengesList'))
const Spaces = React.lazy(() => import('./features/spaces'))
const CreateChallengePage = React.lazy(() => import('./features/challenges/form/CreateChallengePage'))
const EditChallengePage = React.lazy(() => import('./features/challenges/form/EditChallengePage'))
const ProposeChallengePage = React.lazy(() => import('./features/challenges/form/ProposeChallengePage'))
const NewsListPage = React.lazy(() => import('./features/news/NewsPage'))
const CreateNewsItemPage = React.lazy(() => import('./features/news/form/CreateNewsItemPage'))
const LandingPage = React.lazy(() => import('./features/overview/OverviewPage'))
const AboutPage = React.lazy(() => import('./pages/AboutPage'))
const NotificationsPage = React.lazy(() => import('./pages/Account/Notifications'))
const ExpertsListPage = React.lazy(() => import('./features/experts/ExpertsList'))
const ChallengeDetailsPage = React.lazy(() => import('./features/challenges/details/ChallengeDetails'))
const WorkflowRunPage = React.lazy(() => import('./features/workflows/run/RunWorkflowForm'))
const EditNewsItemPage = React.lazy(() => import('./features/news/form/EditNewsItemPage'))
const ListAdminNews = React.lazy(() => import('./features/news/ListAdminNews'))
const ToS = React.lazy(() => import('./pages/ToS'))
const Security = React.lazy(() => import('./pages/Security'))

const RootComponent = () => {
  const authModal = useModal()
  const expiringSessionModal = useModal()
  const [railsAlertHeight, setRailsAlertHeight] = useState(0)

  useEffect(() => {
    // Calculate the height of the rails-alert element
    const alertElement = document.querySelector('.rails-alert')
    if (alertElement) {
        setRailsAlertHeight(alertElement.clientHeight as number)
    }
  }, [])

  return (
    <ThemeProvider>
      <React.Fragment>
        <GlobalStyle railsAlertHeight={railsAlertHeight} />
        <QueryClientProvider
          client={queryClient({
            onAuthFailure: () => authModal.setShowModal(true),
          })}
        >
          <AlertDismissedProvider>
            <NavOrderProvider>
              <NavFavoritesProvider>
                <Header />
                <QueryParamProvider adapter={ReactRouter6Adapter}>
                  <React.Suspense fallback={<LayoutLoader />}>
                    <Outlet />
                  </React.Suspense>
                </QueryParamProvider>
                <ToastContainer
                  position="top-right"
                  transition={Slide}
                  hideProgressBar
                  pauseOnHover
                  limit={5}
                />
                <AuthModal {...authModal} />
                <ExpiringSessionModal modal={expiringSessionModal} />
              </NavFavoritesProvider>
            </NavOrderProvider>
          </AlertDismissedProvider>
        </QueryClientProvider>
      </React.Fragment>
    </ThemeProvider>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootComponent />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'admin/*', element: <Admin /> },
      { path: 'docs/*', element: <Docs /> },
      { path: 'home/*', element: <Home2 /> },
      { path: 'account/notifications', element: <NotificationsPage /> },
      { path: 'spaces/*', element: <Spaces /> },
      { path: 'workflows/:workflowUid/analyses/new', element: <WorkflowRunPage /> },
      { path: 'challenges', element: <ChallengesList /> },
      { path: 'challenges/create', element: <CreateChallengePage /> },
      { path: 'challenges/:challengeId/edit', element: <EditChallengePage /> },
      { path: 'challenges/propose', element: <ProposeChallengePage /> },
      { path: 'challenges/:challengeId/:page', element: <ChallengeDetailsPage /> },
      { path: 'challenges/:challengeId', element: <ChallengeDetailsPage /> },
      { path: 'news', element: <NewsListPage /> },
      { path: 'experts/:expertId/*', element: <ExpertsSinglePage /> },
      { path: 'experts', element: <ExpertsListPage /> },
      { path: 'terms', element: <ToS /> },
      { path: 'security', element: <Security /> },
      { path: 'admin/news', element: <ListAdminNews /> },
      { path: 'admin/news/create', element: <CreateNewsItemPage /> },
      { path: 'admin/news/:id/edit', element: <EditNewsItemPage /> },
      { path: 'comparisons/:identifier/track', element: <TrackPage /> },
      { path: 'notes/:identifier/track', element: <TrackPage /> },
      { path: 'data-portals/*', element: <DataPortalRoutes /> },
      { path: 'daaas', element: <Navigate to="/data-portals/main" replace /> },
      { path: '*', element: <NoFoundPage /> },
    ],
  },
])

const root = () => {
  return (
    <React.Fragment>
      <RouterProvider router={router} />
    </React.Fragment>
  )
}

root.displayName = 'Root'

export default root
