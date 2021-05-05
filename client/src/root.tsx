import React from 'react'
import { Router, Switch, Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'

import history from './utils/history'
import SpacesListPage from './views/pages/Spaces/SpacesListPage'
import SpacePage from './views/pages/Spaces/SpacePage'
import NoFoundPage from './views/pages/NoFoundPage'
import NewSpacePage from './views/pages/Spaces/NewSpacePage'
import HomePage from './views/pages/Home'
import ChallengesListPage from './views/pages/Challenges/ChallengesListPage'
import ChallengeDetailsPage from './views/pages/Challenges/ChallengeDetailsPage'
import ChallengeProposePage from './views/pages/Challenges/ChallengeProposePage'
import NewsListPage from './views/pages/News/NewsListPage'
import ExpertsListPage from './views/pages/Experts/ExpertsListPage'
import { NEW_SPACE_PAGE_ACTIONS } from './constants'
import ErrorWrapper from './views/components/ErrorWrapper'
import { NotificationsPage } from './views/pages/Account/Notifications'
import GlobalStyle from './styles/global'

const root = ({ store }: any) => (
  <Provider store={store}>
    <GlobalStyle />
    <Router history={history}>
      <ErrorWrapper>
        <Switch>
          <Redirect exact from='/home' to='/home/files' />
          <Route path='/home/:page/:tab?' render={(props: any) => <HomePage {...props} />} />
          <Route path='/account/notifications'>
            <NotificationsPage />
          </Route>
          <Route exact path='/spaces'>
            <SpacesListPage />
          </Route>
          <Route exact path='/spaces/new'>
            <NewSpacePage />
          </Route>
          <Route exact path='/spaces/duplicate/:spaceId'>
            <NewSpacePage action={NEW_SPACE_PAGE_ACTIONS.DUPLICATE} />
          </Route>
          <Route exact path='/spaces/edit/:spaceId'>
            <NewSpacePage action={NEW_SPACE_PAGE_ACTIONS.EDIT} />
          </Route>
          <Redirect exact from='/spaces/:spaceId' to='/spaces/:spaceId/files' />
          <Route path='/spaces/:spaceId/:page' render={(props) => <SpacePage {...props} />} />
          <Route exact path='/challenges'>
            <ChallengesListPage />
          </Route>
          <Route exact path='/challenges/propose'>
            <ChallengeProposePage />
          </Route>
          <Route path='/challenges/:challengeId/:page' render={(props) => <ChallengeDetailsPage {...props} />} />
          <Route path='/challenges/:challengeId' render={(props) => <ChallengeDetailsPage {...props} />} />
          <Route exact path='/news'>
            <NewsListPage />
          </Route>
          <Route exact path='/experts'>
            <ExpertsListPage />
          </Route>
          <Route path="*">
            <NoFoundPage />
          </Route>
        </Switch>
      </ErrorWrapper>
    </Router>
  </Provider>
)

root.displayName = 'Root'

root.propTypes = {
  store: PropTypes.object.isRequired,
}

export default root
