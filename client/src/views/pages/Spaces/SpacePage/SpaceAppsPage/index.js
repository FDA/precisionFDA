import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { isEmpty } from 'ramda'

import SpaceShape from '../../../../shapes/SpaceShape'
import AppShape from '../../../../shapes/AppShape'
import {
  spaceAppsListSelector,
  spaceAppsLinksSelector,
} from '../../../../../reducers/spaces/apps/selectors'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import SpaceLayout from '../../../../layouts/SpaceLayout'
import AddDataModal from '../../../../components/Space/AddDataModal'
import CopyModal from '../../../../components/Space/Apps/CopyModal'
import { showSpaceAddDataModal } from '../../../../../actions/spaces'
import { fetchApps, resetSpaceAppsFilters, showAppsCopyModal } from '../../../../../actions/spaces'
import SpaceAppsList from '../../../../components/Space/Apps/SpaceAppsList'
import Button from '../../../../components/Button'
import Icon from '../../../../components/Icon'
import { getSpacePageTitle } from '../../../../../helpers/spaces'
import { SPACE_ADD_DATA_TYPES } from '../../../../../constants'


class SpaceAppsPage extends Component {
  loadSpaceApps = () => {
    const { loadApps, resetFilters, spaceId } = this.props
    resetFilters()
    loadApps(spaceId)
  }

  componentDidMount() {
    if (!isEmpty(this.props.space)) {
      this.loadSpaceApps()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.space !== this.props.space) {
      this.loadSpaceApps()
    }
  }

  render() {
    const { spaceId, space, apps, appsLinks, showAddAppsModal, showCopyModal } = this.props
    const checkedApps = apps.filter(((app) => app.isChecked))
    const title = getSpacePageTitle('Apps', space.isPrivate)

    return (
      <SpaceLayout spaceId={spaceId} space={space}>
        <div className="space-page-layout__header-row">
          <h2 className="space-page-layout__sub-title">{title}</h2>
          <div className="space-page-layout__actions">
            {(checkedApps.length > 0 && appsLinks?.copy) && (
              <Button type="primary" onClick={showCopyModal}>
                <span>
                  <Icon icon="fa-clone" />&nbsp;
                  Copy To Space
                </span>
              </Button>
            )}
            { space.links?.add_data &&
              <Button type="primary" onClick={showAddAppsModal}>
                <span>
                  <Icon icon="fa-plus"/>&nbsp;
                  Add Apps
                </span>
              </Button>
            }
          </div>
        </div>

        <div className="pfda-padded-t20">
          <SpaceAppsList apps={apps} />
        </div>

        <AddDataModal space={space} loadFilesHandler={this.loadSpaceApps} />
        <CopyModal apps={checkedApps} loadFilesHandler={this.loadSpaceApps} />
      </SpaceLayout>
    )
  }
}

SpaceAppsPage.propTypes = {
  spaceId: PropTypes.string,
  space: PropTypes.shape(SpaceShape),
  apps: PropTypes.arrayOf(PropTypes.exact(AppShape)),
  appsLinks: PropTypes.shape({
    copy: PropTypes.string,
  }),
  loadApps: PropTypes.func,
  resetFilters: PropTypes.func,
  showAddAppsModal: PropTypes.func,
  showCopyModal: PropTypes.func,
}

SpaceAppsPage.defaultProps = {
  apps: [],
  loadApps: () => {},
  resetFilters: () => {},
  showAddAppsModal: () => {},
  showCopyModal: () => {},
}

const mapStateToProps = (state) => ({
  space: spaceDataSelector(state),
  apps: spaceAppsListSelector(state),
  appsLinks: spaceAppsLinksSelector(state),
})

const mapDispatchToProps = dispatch => ({
  loadApps: (spaceId) => dispatch(fetchApps(spaceId)),
  resetFilters: () => dispatch(resetSpaceAppsFilters()),
  showAddAppsModal: () => dispatch(showSpaceAddDataModal(SPACE_ADD_DATA_TYPES.APPS)),
  showCopyModal: () => dispatch(showAppsCopyModal()),
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaceAppsPage)

export {
  SpaceAppsPage,
}
