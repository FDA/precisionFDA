import React from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import NavigationBar, {
  NavigationBarBanner,
  NavigationBarPublicLandingTitle,
} from '../../components/NavigationBar/NavigationBar'
import { PageContainerMargin } from '../../components/Page/styles'
import { usePageMeta } from '../../hooks/usePageMeta'
import PublicLayout from '../../layouts/PublicLayout'
import { Tagline } from '../../pages/Tagline'
import { DataPortalsAuthPickerModal } from '../auth/DataPortalsAuthPickerModal'
import { useAuthUser } from '../auth/useAuthUser'
import { useModal } from '../modal/useModal'
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
  const { loading, user } = useAuthUser(true)

  const modal = useModal()

  if (!user && !loading ) {
    // if accessed as non-logged user, present modal with landing-page background
    return <PublicLayout>
      <DataPortalsAuthPickerModal modal={modal}/>
      <NavigationBar user={null}>
        <PageContainerMargin>
          <NavigationBarBanner>
            <NavigationBarPublicLandingTitle>
              <Tagline/>
            </NavigationBarPublicLandingTitle>
          </NavigationBarBanner>
        </PageContainerMargin>
      </NavigationBar>
      <div style={{height: '100%'}}></div>
    </PublicLayout>
  }

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
