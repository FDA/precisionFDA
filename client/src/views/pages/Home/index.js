import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { homeCurrentTabSelector } from '../../../reducers/home/page/selectors'
import HomeAppsPage from './HomeApps/HomeAppsPage'
import HomeAppsFeaturedPage from './HomeApps/HomeAppsFeaturedPage'
import HomeAppsEverybodyPage from './HomeApps/HomeAppsEverybodyPage'
import HomeAppsSpacesPage from './HomeApps/HomeAppsSpacesPage'
import HomeAppsSinglePage from './HomeApps/HomeAppsSinglePage'
import { HomeDatabasesPage } from './HomeDatabases/HomeDatabasesPage'
import { HomeDatabasesSinglePage } from './HomeDatabases/HomeDatabasesSinglePage'
import { HomeDatabasesCreatePage } from './HomeDatabases/HomeDatabasesCreatePage'
import HomeFilesSinglePage from './HomeFiles/HomeFilesSinglePage'
import HomeLayout from '../../layouts/HomeLayout'
import HomeFilesPage from './HomeFiles/HomeFilesPage'
import HomeFilesFeaturedPage from './HomeFiles/HomeFilesFeaturedPage'
import HomeFilesEverybodyPage from './HomeFiles/HomeFilesEverybodyPage'
import HomeFilesSpacesPage from './HomeFiles/HomeFilesSpacesPage'
import HomeWorkflowsPage from './HomeWorkflows/HomeWorkflowsPage'
import HomeWorkflowsFeaturedPage from './HomeWorkflows/HomeWorkflowsFeaturedPage'
import HomeWorkflowsEveryonePage from './HomeWorkflows/HomeWorkflowsEveryonePage'
import HomeWorkflowsSpacesPage from './HomeWorkflows/HomeWorkflowsSpacesPage'
import HomeWorkflowsSinglePage from './HomeWorkflows/HomeWorkflowsSinglePage'
import HomeExecutionsTable from './HomeExecutions/HomeExecutionsPage'
import HomeExecutionsSpacesPage from './HomeExecutions/HomeExecutionsSpacesPage'
import HomeExecutionsEverybodyPage from './HomeExecutions/HomeExecutionsEverybodyPage'
import HomeExecutionsSinglePage from './HomeExecutions/HomeExecutionsSinglePage'
import HomeExecutionsFeaturedPage from './HomeExecutions/HomeExecutionsFeaturedPage'
import HomeAssetsPage from './HomeAssets/HomeAssetsPage'
import HomeAssetsFeaturedPage from './HomeAssets/HomeAssetsFeaturedPage'
import HomeAssetsEverybodyPage from './HomeAssets/HomeAssetsEverybodyPage'
import HomeAssetsSpacesPage from './HomeAssets/HomeAssetsSpacesPage'
import HomeAssetSinglePage from './HomeAssets/HomeAssetSinglePage'
import { contextUserSelector } from '../../../reducers/context/selectors'
import { GuestNotAllowed } from '../../../components/GuestNotAllowed'
import DefaultLayout from '../../layouts/DefaultLayout'
import { HOME_DATABASES_ACTIONS } from '../../../constants'


const HomePage = ({ match }) => {
  let { page } = match.params
  const currentTab = useSelector(homeCurrentTabSelector)
  const user = useSelector(contextUserSelector)

  if(user.is_guest) {
    return <DefaultLayout><GuestNotAllowed /></DefaultLayout>
  }

  let uid
  let tab = match.params.tab ? `/${match.params.tab}` : ''

  if (match.params.tab && match.params.tab.split('-')[0]) {
    switch (match.params.tab.split('-')[0]) {
      case 'app':
        tab = '/app-page'
        break
      case 'dbcluster':
        tab = '/database-page'
        break
      case 'file':
        tab = '/file-page'
        break
      case 'workflow':
        tab = '/workflow-page'
        break
      case 'job':
        tab = '/job-page'
        break
      default:
        break
    }
    uid = match.params.tab
  }

  switch (page + tab) {
    case 'apps':
      return <HomeAppsPage />
    case 'apps/featured':
      return <HomeAppsFeaturedPage />
    case 'apps/everybody':
      return <HomeAppsEverybodyPage />
    case 'apps/spaces':
      return <HomeAppsSpacesPage />
    case 'apps/app-page':
      return <HomeAppsSinglePage uid={uid} />
    case 'databases':
      return <HomeDatabasesPage />
    case 'databases/database-page':
      return <HomeDatabasesSinglePage dxid={uid} />
    case 'databases/new':
      return <HomeDatabasesCreatePage
        currentTab={'Private'}
        action={HOME_DATABASES_ACTIONS.CREATE}
      />
    case 'files':
      return <HomeFilesPage />
    case 'files/featured':
      return <HomeFilesFeaturedPage />
    case 'files/everybody':
      return <HomeFilesEverybodyPage />
    case 'files/spaces':
      return <HomeFilesSpacesPage />
    case 'files/file-page':
      return <HomeFilesSinglePage uid={uid} currentTab={currentTab} />
    case 'workflows':
      return <HomeWorkflowsPage />
    case 'workflows/featured':
      return <HomeWorkflowsFeaturedPage />
    case 'workflows/everybody':
      return <HomeWorkflowsEveryonePage />
    case 'workflows/spaces':
      return <HomeWorkflowsSpacesPage />
    case 'workflows/workflow-page':
      return <HomeWorkflowsSinglePage uid={uid} />
    case 'jobs':
      return <HomeExecutionsTable />
    case 'jobs/spaces':
      return <HomeExecutionsSpacesPage />
    case 'jobs/everybody':
      return <HomeExecutionsEverybodyPage />
    case 'jobs/job-page':
      return <HomeExecutionsSinglePage uid={uid} />
    case 'jobs/featured':
      return <HomeExecutionsFeaturedPage />
    case 'assets':
      return <HomeAssetsPage />
    case 'assets/featured':
      return <HomeAssetsFeaturedPage />
    case 'assets/everybody':
      return <HomeAssetsEverybodyPage />
    case 'assets/spaces':
      return <HomeAssetsSpacesPage />
    case 'assets/file-page':
      return <HomeAssetSinglePage uid={uid} />
    default:
      return <HomeLayout>Page not found</HomeLayout>
  }
}

HomePage.propTypes = {
  match: PropTypes.any,
}

export default HomePage

export {
  HomePage,
}

