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
import { NEW_SPACE_PAGE_ACTIONS } from './constants'
import ErrorWrapper from './views/components/ErrorWrapper'


const root = ({ store }) => (
  <Provider store={store}>
    <Router history={history}>
      <ErrorWrapper>
        <Switch>
          <Redirect exact from='/home' to='/home/apps' />
          <Route path='/home/:page/:tab?' render={(props) => <HomePage {...props} />} />
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
