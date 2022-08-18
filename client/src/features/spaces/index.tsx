import React from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { UserLayout } from '../../views/layouts/UserLayout'
import { CreateSpace } from './form/CreateSpace'
import { DuplicateSpace } from './form/DuplicateSpace'
import { SpaceSettings } from './form/SpaceSettings'
import { SpaceShow } from './show/SpaceShow'
import { Spaces2List } from './SpacesList'


export const Spaces = () => {
  const { path } = useRouteMatch()

  return (
    <UserLayout>
      <Switch>
        <Route exact path={`${path}`}>
          <Spaces2List />
        </Route>
        <Route exact path={`${path}/:spaceId/edit`}>
          <SpaceSettings />
        </Route>
        <Route exact path={`${path}/:spaceId/duplicate`}>
          <DuplicateSpace />
        </Route>
        <Route exact path={`${path}/new`}>
          <CreateSpace />
        </Route>
        <Route path={`${path}/:spaceId`}>
          <SpaceShow />
        </Route>
      </Switch>
    </UserLayout>
  )
}
