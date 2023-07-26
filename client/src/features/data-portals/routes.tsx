import React from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { usePageMeta } from '../../hooks/usePageMeta'
import DataPortalsListPage from './list/DataPortalsListPage'
import EditDataPortalPage from './form/EditDataPortalPage'

const CreateDataPortalPage = React.lazy(
  () => import('./form/CreateDataPortalPage'),
)
const DataPortalDetailsPage = React.lazy(
  () => import('./details/DataPortalDetailsPage'),
)
const MainDataPortalDetailsPage = React.lazy(
  () => import('./details/MainDataPortalDetailsPage'),
)
const DataPortalContentEditPage = React.lazy(
  () => import('./form/DataPortalContentEditPage'),
)
const DataPortalResourcesPage = React.lazy(
  () => import('./resources/DataPortalResourcesPage'),
)

const DataPortalRoutes = () => {
  usePageMeta({ title: 'DAaaS - precisionFDA' })
  const { path } = useRouteMatch()

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <DataPortalsListPage />
      </Route>
      <Route exact path={`${path}/create`}>
        <CreateDataPortalPage />
      </Route>
      <Route exact path={`${path}/main`}>
        <MainDataPortalDetailsPage />
      </Route>
      <Route exact path={`${path}/:portalId`}>
        <DataPortalDetailsPage />
      </Route>
      <Route exact path={`${path}/:portalId/resources`}>
        <DataPortalResourcesPage />
      </Route>
      <Route exact path={`${path}/:portalId/content`}>
        <DataPortalContentEditPage />
      </Route>
      <Route exact path={`${path}/:portalId/edit`}>
        <EditDataPortalPage />
      </Route>
    </Switch>
  )
}

export default DataPortalRoutes
