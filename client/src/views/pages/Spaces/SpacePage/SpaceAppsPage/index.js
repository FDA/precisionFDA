import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { isEmpty } from 'ramda'

import SpaceShape from '../../../../shapes/SpaceShape'
import AppShape from '../../../../shapes/AppShape'
import {
  spaceAppsListSelector,
  spaceAppsLinksSelector,
  spaceAppsCopyToPrivateSelector,
} from '../../../../../reducers/spaces/apps/selectors'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import SpaceLayout from '../../../../layouts/SpaceLayout'
import AddDataModal from '../../../../components/Space/AddDataModal'
import CopyModal from '../../../../components/Space/Apps/CopyModal'
import { showSpaceAddDataModal } from '../../../../../actions/spaces'
import {
  fetchApps,
  resetSpaceAppsFilters,
  showAppsCopyModal,
  copyToPrivate,
} from '../../../../../actions/spaces'
import SpaceAppsList from '../../../../components/Space/Apps/SpaceAppsList'
import Button from '../../../../components/Button'
import Icon from '../../../../components/Icon'
import { getSpacePageTitle } from '../../../../../helpers/spaces'
import { SPACE_ADD_DATA_TYPES, OBJECT_TYPES } from '../../../../../constants'


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
    const {
      spaceId, space, apps, appsLinks, showAddAppsModal,
      showCopyModal, copyToPrivate, isCopyingToPrivate,
    } = this.props

    const checkedApps = apps.filter(((app) => app.isChecked))
    const title = getSpacePageTitle('Apps', space.isPrivate)

    const copyToPrivateHandler = () => {
      return copyToPrivate(appsLinks?.copy_private, checkedApps.map((app) => app.id))
    }

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
            {(checkedApps.length > 0 && appsLinks?.copy_private) && (
              <Button type="primary" onClick={copyToPrivateHandler} disabled={isCopyingToPrivate}>
                <span>
                  <Icon icon="fa-lock" />&nbsp;
                  {isCopyingToPrivate ? 'Copying...' : 'Copy To Private'}
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
  isCopyingToPrivate: PropTypes.bool,
  apps: PropTypes.arrayOf(PropTypes.exact(AppShape)),
  appsLinks: PropTypes.shape({
    copy: PropTypes.string,
    copy_private: PropTypes.string,
  }),
  loadApps: PropTypes.func,
  resetFilters: PropTypes.func,
  showAddAppsModal: PropTypes.func,
  showCopyModal: PropTypes.func,
  copyToPrivate: PropTypes.func,
}

SpaceAppsPage.defaultProps = {
  apps: [],
  isCopyingToPrivate: false,
  loadApps: () => {},
  resetFilters: () => {},
  showAddAppsModal: () => {},
  showCopyModal: () => {},
  copyToPrivate: () => {},
}

const mapStateToProps = (state) => ({
  space: spaceDataSelector(state),
  apps: spaceAppsListSelector(state),
  isCopyingToPrivate: spaceAppsCopyToPrivateSelector(state).isCopying,
  appsLinks: spaceAppsLinksSelector(state),
})

const mapDispatchToProps = dispatch => ({
  loadApps: (spaceId) => dispatch(fetchApps(spaceId)),
  resetFilters: () => dispatch(resetSpaceAppsFilters()),
  showAddAppsModal: () => dispatch(showSpaceAddDataModal(SPACE_ADD_DATA_TYPES.APPS)),
  showCopyModal: () => dispatch(showAppsCopyModal()),
  copyToPrivate: (link, ids) => dispatch(copyToPrivate(link, ids, OBJECT_TYPES.APP)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaceAppsPage)

export {
  SpaceAppsPage,
}
