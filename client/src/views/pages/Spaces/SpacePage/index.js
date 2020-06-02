import React from 'react'
import PropTypes from 'prop-types'

import SpaceFilesPage from './SpaceFilesPage'
import SpaceAppsPage from './SpaceAppsPage'
import SpaceJobsPage from './SpaceJobsPage'
import SpaceWorkflowsPage from './SpaceWorkflowsPage'
import SpaceMembersPage from './SpaceMembersPage'


const SpacePage = ({ match }) => {
  const { spaceId, page } = match.params
  switch (page) {
    case 'files':
      return <SpaceFilesPage spaceId={spaceId} key={spaceId} />
    case 'apps':
      return <SpaceAppsPage spaceId={spaceId} key={spaceId} />
    case 'jobs':
      return <SpaceJobsPage spaceId={spaceId} key={spaceId} />
    case 'workflows':
      return <SpaceWorkflowsPage spaceId={spaceId} key={spaceId} />
    case 'members':
      return <SpaceMembersPage spaceId={spaceId} key={spaceId} />
    default:
      return <SpaceFilesPage spaceId={spaceId} key={spaceId} />
  }
}

export default SpacePage

SpacePage.propTypes = {
  match: PropTypes.any,
}
