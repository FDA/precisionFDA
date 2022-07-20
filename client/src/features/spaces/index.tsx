import React from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import DefaultLayout from '../../views/layouts/DefaultLayout'
import { CreateSpace } from './form/CreateSpace'
import { DuplicateSpace } from './form/DuplicateSpace'
import { SpaceSettings } from './form/SpaceSettings'
import { SpaceShow } from './show/SpaceShow'
import { Spaces2List } from './SpacesList'



export const Spaces = () => {
  const { path } = useRouteMatch()

  return (
    <DefaultLayout>
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
    </DefaultLayout>
  )
}
