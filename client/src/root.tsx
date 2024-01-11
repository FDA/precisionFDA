/* eslint-disable react/jsx-fragments */
import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom'
import { Slide, toast } from 'react-toastify'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'
import 'react-toastify/dist/ReactToastify.css'
import { QueryParamProvider } from 'use-query-params'
import { AuthModal } from './features/auth/AuthModal'
import { useModal } from './features/modal/useModal'
import GlobalStyle from './styles/global'
import { StyledToastContainer } from './styles/toast.styles'
import ExpertsSinglePage from './features/experts/details/index'
import NoFoundPage from './pages/NoFoundPage'
import { ExpiringSessionModal } from './features/auth/ExpiringSessionModal'
import queryClient from './utils/queryClient'
import DataPortalRoutes from './features/data-portals/routes'
import { LayoutLoader } from './layouts/UserLayout'
import { ThemeProvider } from './utils/ThemeContext'
import Header from './components/Header'

const Home2 = React.lazy(() => import('./features/home'))
const Docs = React.lazy(() => import('./features/docs'))
const ChallengesList = React.lazy(
  () => import('./features/challenges/list/ChallengesList'),
)
const Spaces = React.lazy(() => import('./features/spaces'))
const CreateChallengePage = React.lazy(
  () => import('./features/challenges/form/CreateChallengePage'),
)
const EditChallengePage = React.lazy(
  () => import('./features/challenges/form/EditChallengePage'),
)
const ProposeChallengePage = React.lazy(
  () => import('./features/challenges/form/ProposeChallengePage'),
)
const NewsListPage = React.lazy(() => import('./features/news/NewsPage'))
const CreateNewsItemPage = React.lazy(() => import('./features/news/form/CreateNewsItemPage'))
const LandingPage = React.lazy(() => import('./features/overview/OverviewPage'))
const AboutPage = React.lazy(() => import('./pages/AboutPage'))
const NotificationsPage = React.lazy(
  () => import('./pages/Account/Notifications'),
)
const ExpertsListPage = React.lazy(
  () => import('./features/experts/ExpertsList'),
)
const ChallengeDetailsPage = React.lazy(
  () => import('./features/challenges/details/ChallengeDetails'),
)
const WorkflowRunPage = React.lazy(
  () => import('./features/workflows/run/WorkflowRun'),
)
const UsersList = React.lazy(() => import('./features/admin/users'))
const EditNewsItemPage = React.lazy(() => import('./features/news/form/EditNewsItemPage'))
const ListAdminNews = React.lazy(() => import('./features/news/ListAdminNews'))
const ToS = React.lazy(() => import('./pages/ToS'))
const Security = React.lazy(() => import('./pages/Security'))

const RootComponent = () => {
  const authModal = useModal()
  const expiringSessionModal = useModal()
  toast.configure({ limit: 5 })

  return (
    <ThemeProvider>
      <React.Fragment>
        <GlobalStyle />
        <QueryClientProvider
          client={queryClient({
            onAuthFailure: () => authModal.setShowModal(true),
          })}
        >
          <Header />
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <React.Suspense fallback={<LayoutLoader />}>
              <Outlet />
            </React.Suspense>
          </QueryParamProvider>
          <StyledToastContainer
            position="top-right"
            transition={Slide}
            hideProgressBar
            pauseOnHover
          />
          <AuthModal {...authModal} />
          <ExpiringSessionModal modal={expiringSessionModal} />
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
      { path: 'experts/:expertId/:page', element: <ExpertsSinglePage /> },
      { path: 'experts/:expertId/*', element: <ExpertsSinglePage /> },
      { path: 'experts', element: <ExpertsListPage /> },
      { path: 'terms', element: <ToS /> },
      { path: 'security', element: <Security /> },
      { path: 'admin/users', element: <UsersList /> },
      { path: 'admin/news', element: <ListAdminNews /> },
      { path: 'admin/news/create', element: <CreateNewsItemPage /> },
      { path: 'admin/news/:id/edit', element: <EditNewsItemPage /> },
      { path: 'data-portals/*', element: <DataPortalRoutes /> },
      { path: 'daaas', element: <Navigate to="/data-portals/main" /> },
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
