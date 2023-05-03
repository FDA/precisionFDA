/* eslint-disable react/jsx-fragments */
import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Route, Router, Switch } from 'react-router-dom'
import { Slide, toast } from 'react-toastify'
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5'
import 'react-toastify/dist/ReactToastify.css'
import { QueryParamProvider } from 'use-query-params'
import { AuthModal } from './features/auth/AuthModal'
import { useModal } from './features/modal/useModal'
import GlobalStyle from './styles/global'
import { StyledToastContainer } from './styles/toast.styles'
import history from './utils/history'
import { Header } from './components/Header'
import { JobRunForm } from './features/home/apps/run/JobRun'
import { WorkflowRunForm } from './features/home/workflows/run/WorkflowRun'
import { Loader } from './components/Loader'
import ExpertsSinglePage from './features/experts/details/index'
import NoFoundPage from './pages/NoFoundPage'
import { ExpiringSessionModal } from './features/auth/ExpiringSessionModal'
import queryClient from './utils/queryClient'


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
const UsersList = React.lazy(() => import('./features/admin/users'))
const EditNewsItemPage = React.lazy(() => import('./features/news/form/EditNewsItemPage'))
const ListAdminNews = React.lazy(() => import('./features/news/ListAdminNews'))
const ToS = React.lazy(() => import('./pages/ToS'))
const Security = React.lazy(() => import('./pages/Security'))

const root = () => {
  const authModal = useModal()
  const expiringSessionModal = useModal()
  toast.configure()

  return (
    <React.Fragment>
      <GlobalStyle />
      <QueryClientProvider
        client={queryClient({
          onAuthFailure: () => authModal.setShowModal(true),
        })}
      >
        <Router history={history}>
          <Header />
          <React.Suspense fallback={<Loader />}>
            <QueryParamProvider adapter={ReactRouter5Adapter}>
              <Switch>
                <Route exact path="/">
                  <LandingPage />
                </Route>
                <Route exact path="/about">
                  <AboutPage />
                </Route>
                <Route path="/docs">
                  <Docs />
                </Route>
                <Route path="/home">
                  <Home2 />
                </Route>
                <Route path="/account/notifications">
                  <NotificationsPage />
                </Route>
                <Route path="/spaces">
                  <Spaces />
                </Route>
                <Route exact path="/apps/:appUid/jobs/new">
                  <JobRunForm />
                </Route>
                <Route exact path="/workflows/:workflowUid/analyses/new">
                  <WorkflowRunForm />
                </Route>
                <Route exact path="/challenges">
                  <ChallengesList />
                </Route>
                <Route exact path="/challenges/create">
                  <CreateChallengePage />
                </Route>
                <Route exact path="/challenges/:challengeId/edit">
                  <EditChallengePage />
                </Route>
                <Route exact path="/challenges/propose">
                  <ProposeChallengePage />
                </Route>
                <Route path="/challenges/:challengeId/:page">
                  <ChallengeDetailsPage />
                </Route>
                <Route path="/challenges/:challengeId">
                  <ChallengeDetailsPage />
                </Route>
                <Route exact path="/news">
                  <NewsListPage />
                </Route>
                <Route path="/experts/:expertId/:page">
                  <ExpertsSinglePage />
                </Route>
                <Route path="/experts/:expertId">
                  <ExpertsSinglePage />
                </Route>
                <Route exact path="/experts">
                  <ExpertsListPage />
                </Route>
                <Route exact path="/terms">
                  <ToS />
                </Route>
                <Route exact path="/security">
                  <Security />
                </Route>
                <Route exact path="/admin/users">
                  <UsersList />
                </Route>
                <Route exact path="/admin/news">
                  <ListAdminNews />
                </Route>
                <Route exact path="/admin/news/create">
                  <CreateNewsItemPage />
                </Route>
                <Route exact path="/admin/news/:id/edit">
                  <EditNewsItemPage />
                </Route>
                <Route path="*">
                  <NoFoundPage />
                </Route>
              </Switch>
            </QueryParamProvider>
          </React.Suspense>
          <StyledToastContainer
            position="top-right"
            transition={Slide}
            hideProgressBar
            pauseOnHover
          />
        </Router>
        <AuthModal {...authModal} />
        <ExpiringSessionModal modal={expiringSessionModal} />
      </QueryClientProvider>
    </React.Fragment>
  )
}

root.displayName = 'Root'

export default root
