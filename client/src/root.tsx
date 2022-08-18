import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Provider } from 'react-redux'
import { Redirect, Route, Router, Switch } from 'react-router-dom'
import { Slide, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { PushReplaceHistory, QueryParamProvider } from 'use-query-params'
import { NEW_SPACE_PAGE_ACTIONS } from './constants'
import { AuthModal } from './features/auth/AuthModal'
import { Home2 } from './features/home'
import { FileShow } from './features/home/files/show/FileShow'
import { useModal } from './features/modal/useModal'
import { Spaces } from './features/spaces'
import { SpaceShow } from './features/spaces/show/SpaceShow'
import { Spaces2List } from './features/spaces/SpacesList'
import GlobalStyle from './styles/global'
import { StyledToastContainer } from './styles/toast.styles'
import history from './utils/history'
import ErrorWrapper from './views/components/ErrorWrapper'
import { NotificationsPage } from './views/pages/Account/Notifications'
import { UsersList } from './features/admin/users'
import OldChallengeDetailsPage from './views/pages/Challenges/ChallengeDetailsPage'
import ChallengeProposePage from './views/pages/Challenges/ChallengeProposePage'
import ChallengesListPage from './views/pages/Challenges/ChallengesListPage'
import ExpertsListPage from './views/pages/Experts/ExpertsListPage'
import { ExpertsSinglePage } from './views/pages/Experts/ExpertsSinglePage'
import HomePage from './views/pages/Home'
import AboutPage from './views/pages/Landing/AboutPage'
import LandingPage from './views/pages/Landing/LandingPage'
import NewsListPage from './views/pages/News/NewsListPage'
import NoFoundPage from './views/pages/NoFoundPage'
import NewSpacePage from './views/pages/Spaces/NewSpacePage'
import SpacePage from './views/pages/Spaces/SpacePage'
import SpacesListPage from './views/pages/Spaces/SpacesListPage'
import { ChallengeDetailsPage } from './features/challenges/details/ChallengeDetails'
import { ToS } from './views/pages/ToS'
import { ChallengesList } from './features/challenges/list/ChallengesList'
import { EditChallengePage } from './features/challenges/form/EditChallenge'
import { CreateChallengePage } from './features/challenges/form/CreateChallenge'

const queryClient = ({ onAuthFailure }: { onAuthFailure: () => void }) =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // We disable refetching on focus as it can extend the session without user input
        refetchOnWindowFocus: false,
        onSuccess: (res: any) => {
          // Catch if cookie expired
          // if(process.env.NODE_ENV !== 'development') {
          if (res?.failure === 'Authentication failure') {
            onAuthFailure()
          }
          // }
        },
      },
    },
  })

// NOTE(samuel) this happens when window.location.pathname and 
const possiblyMismatchedRoutes = [
  '/admin/users'
]

  
const root = ({ store }: any) => {
  const authModal = useModal()
  toast.configure()

  return (
    <Provider store={store}>
      <GlobalStyle />
      <QueryClientProvider
        client={queryClient({
          onAuthFailure: () => authModal.setShowModal(true),
        })}
      >
        <Router history={history}>
          <QueryParamProvider
            ReactRouterRoute={Route}
            history={history as unknown as PushReplaceHistory}
            location={history.location as unknown as Location}
          >
            {/* <SessionExpiration authModal={authModal} /> */}
            <ErrorWrapper>
              <Switch>
                { // TODO(samuel) temporary hotfix for incorrect routing, remove when admin dashboard gets implemented in react
                  (function () {
                    const isRouteMismatched = possiblyMismatchedRoutes.includes(window.location.pathname)
                    // TODO(samuel) for some reason history.location is not overwritten sometimes
                    if (isRouteMismatched) {
                      return <Redirect exact from='/' to={window.location.pathname} />
                    }

                  })()
                }
                <Route exact path="/">
                  <LandingPage />
                </Route>
                <Route exact path="/about">
                  <AboutPage />
                </Route>
                <Route exact path="/files/:fileId">
                  <FileShow />
                </Route>
                <Route path="/home">
                  <Home2 />
                </Route>
                <Redirect exact from="/home-old" to="/home-old/files" />
                <Route
                  path="/home-old/:page/:tab?"
                  render={(props: any) => <HomePage {...props} />}
                />
                <Route path="/account/notifications">
                  <NotificationsPage />
                </Route>
                <Route path="/spaces">
                  <Spaces />
                </Route>

                <Route exact path="/spaces-old/new">
                  <NewSpacePage />
                </Route>
                <Route exact path="/spaces-old/duplicate/:spaceId">
                  <NewSpacePage action={NEW_SPACE_PAGE_ACTIONS.DUPLICATE} />
                </Route>
                <Route exact path="/spaces-old/edit/:spaceId">
                  <NewSpacePage action={NEW_SPACE_PAGE_ACTIONS.EDIT} />
                </Route>
                <Redirect
                  exact
                  from="/spaces-old/:spaceId"
                  to="/spaces-old/:spaceId/files"
                />
                <Route
                  path="/spaces-old/:spaceId/:page"
                  render={props => <SpacePage {...props} />}
                />

                <Route exact path="/challenges-old">
                  <ChallengesListPage />
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
                  <ChallengeProposePage />
                </Route>
                <Route path="/challenges/:challengeId/:page">
                  <ChallengeDetailsPage />
                </Route>
                <Route
                  path="/challenges-old/:challengeId/:page"
                  render={props => <OldChallengeDetailsPage {...props} />}
                />
                <Route path="/challenges/:challengeId">
                  <ChallengeDetailsPage />
                </Route>
                <Route
                  path="/challenges-old/:challengeId"
                  render={props => <OldChallengeDetailsPage {...props} />}
                />
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
                <Route exact path="/admin/users">
                  <UsersList />
                </Route>
                <Route path="*">
                  <NoFoundPage />
                </Route>
              </Switch>
            </ErrorWrapper>
          </QueryParamProvider>
        </Router>
        <AuthModal {...authModal} />
        <StyledToastContainer
          position="top-right"
          transition={Slide}
          hideProgressBar
          pauseOnHover
        />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </Provider>
  )
}

root.displayName = 'Root'

root.propTypes = {
  store: PropTypes.object.isRequired,
}

export default root
