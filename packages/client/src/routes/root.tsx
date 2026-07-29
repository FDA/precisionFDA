import React, { useEffect } from 'react'
import 'react-tooltip/dist/react-tooltip.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Navigate, Outlet, type RouteObject, useLocation, useParams } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AlertDismissedProvider } from '@/features/admin/alerts/useAlertDismissedLocalStorage'
import { ExpiringSessionModal } from '@/features/auth/ExpiringSessionModal'
import { SessionExpiredModal } from '@/features/auth/SessionExpiredModal'
import { FileUploadModalProvider } from '@/features/files/actionModals/useFileUploadModal'
import { useModal } from '@/features/modal/useModal'
import { useRailsFlashMessages } from '@/hooks/useRailsFlashMessages'
import { LayoutLoader } from '@/layouts/UserLayout'
import { OnlineStatusProvider } from '@/utils/OnlineStatusContext'
import { PFDAToastContainer } from '@/utils/PFDAToastContainer'
import queryClientInstance, { setAuthFailureCallback } from '@/utils/queryClient'
import { ThemeProvider } from '@/utils/ThemeContext'
import AuthWall from '../AuthWall'
import Header from '../components/Header/Header'
import NoFoundPage from '../pages/NoFoundPage'
import GlobalStyle from '../styles/global'
import accountRoutes from './account'
import { protectedChallengeRoutes, publicChallengeRoutes } from './challenges'
import { homeRoutes } from './home'
import spacesRoutes from './spaces'

const Noop = (): null => null

const TanStackDevtools = import.meta.env.DEV
  ? React.lazy(() => import('@tanstack/react-devtools').then(m => ({ default: m.TanStackDevtools })))
  : Noop

const ReactQueryDevtoolsPanel = import.meta.env.DEV
  ? React.lazy(() => import('@tanstack/react-query-devtools').then(m => ({ default: m.ReactQueryDevtoolsPanel })))
  : Noop

const DataPortalRoutes = React.lazy(() => import('../features/data-portals/routes'))
const HomeShowLayout = React.lazy(() => import('../features/home/HomeShowLayout'))
const RequestAccessPage = React.lazy(() => import('../features/request-access/RequestAccessPage'))
const ExpertsSinglePage = React.lazy(() => import('../features/experts/details/index'))
const PublishingPage = React.lazy(() => import('../features/publishing/PublishingPage'))
const TrackPage = React.lazy(() => import('../features/tracks/TrackPage'))
const UserDetailsPage = React.lazy(() =>
  import('../features/users/UserDetailsPage').then(m => ({ default: m.UserDetailsPage })),
)
const NewsListPage = React.lazy(() => import('../features/news/NewsPage'))
const LandingPage = React.lazy(() => import('../features/overview/OverviewPage'))
const AboutPage = React.lazy(() => import('../pages/AboutPage'))
const ExpertsListPage = React.lazy(() => import('../features/experts/ExpertsList'))
const ToS = React.lazy(() => import('../pages/ToS'))
const Security = React.lazy(() => import('../pages/Security'))

const AdminRouteRedirect = () => {
  const location = useLocation()

  return (
    <Navigate
      replace
      to={{
        pathname: location.pathname.replace(/^\/admin(?=\/|$)/, '/account/admin'),
        search: location.search,
        hash: location.hash,
      }}
    />
  )
}

const JobRedirect = () => {
  const { executionUid } = useParams<{ executionUid: string }>()
  return <Navigate to={`/home/executions/${executionUid}`} replace />
}

const RootComponent = () => {
  const sessionExpiredModal = useModal()
  const expiringSessionModal = useModal()

  useEffect(() => {
    setAuthFailureCallback(() => sessionExpiredModal.setShowModal(true))
  }, [])

  useRailsFlashMessages()

  return (
    <ThemeProvider>
      <GlobalStyle railsAlertHeight={0} />
      <QueryClientProvider client={queryClientInstance}>
        <OnlineStatusProvider>
          <FileUploadModalProvider>
            <AlertDismissedProvider>
              <Header />
              <React.Suspense fallback={<LayoutLoader />}>
                <Outlet />
              </React.Suspense>
              <PFDAToastContainer />
              <SessionExpiredModal {...sessionExpiredModal} />
              <ExpiringSessionModal modal={expiringSessionModal} />
              <React.Suspense fallback={null}>
                <TanStackDevtools
                  plugins={[
                    {
                      name: 'TanStack Query',
                      render: <ReactQueryDevtoolsPanel />,
                    },
                  ]}
                />
              </React.Suspense>
            </AlertDismissedProvider>
          </FileUploadModalProvider>
        </OnlineStatusProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <RootComponent />,
    children: [
      // Unprotected routes
      { index: true, element: <LandingPage /> },
      { path: 'about', element: <AboutPage /> },
      ...publicChallengeRoutes,
      { path: 'news', element: <NewsListPage /> },
      { path: 'experts/:expertId/*', element: <ExpertsSinglePage /> },
      { path: 'experts', element: <ExpertsListPage /> },
      { path: 'terms', element: <ToS /> },
      { path: 'request-access', element: <RequestAccessPage /> },
      { path: 'request_access', element: <Navigate to="/request-access" replace /> },
      { path: 'security', element: <Security /> },
      { path: 'daaas', element: <Navigate to="/data-portals/daaas" replace /> },
      { path: '*', element: <NoFoundPage /> },

      // Protected routes
      {
        id: 'protected',
        element: <AuthWall />,
        children: [
          ...protectedChallengeRoutes,
          {
            path: 'home',
            element: <HomeShowLayout />,
            children: homeRoutes,
          },
          {
            path: 'account',
            children: accountRoutes,
          },
          {
            path: 'spaces',
            children: spacesRoutes,
          },
          { path: 'publish', element: <PublishingPage /> },
          { path: 'home/*', id: 'protected-home-not-found', element: <NoFoundPage /> },
          { path: 'spaces/*', id: 'protected-spaces-not-found', element: <NoFoundPage /> },
          { path: 'publish/*', id: 'protected-publish-not-found', element: <NoFoundPage /> },
          { path: 'admin/activity_reports', element: <Navigate to="/account/admin/activity-reports" replace /> },
          { path: 'admin/usage_reports', element: <Navigate to="/account/admin/activity-reports" replace /> },
          { path: 'admin/users_list', element: <Navigate to="/account/admin/users" replace /> },
          { path: 'admin/*', element: <AdminRouteRedirect /> },
          { path: 'comparisons/:identifier/track', element: <TrackPage /> },
          { path: 'notes/:identifier/track', element: <TrackPage /> },
          { path: 'data-portals/*', element: <DataPortalRoutes /> },
          { path: 'jobs/:executionUid', element: <JobRedirect /> },
          { path: 'users/:dxuser', element: <UserDetailsPage /> },
        ],
      },
    ],
  },
]

const router = createBrowserRouter(appRoutes)

const root = () => {
  return <RouterProvider router={router} />
}

root.displayName = 'Root'

export default root
