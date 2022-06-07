import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { isEmpty } from 'ramda'

import SpaceShape from '../../../../shapes/SpaceShape'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import SpaceLayout from '../../../../layouts/SpaceLayout'
import AddDataModal from '../../../../components/Space/AddDataModal'
import { showSpaceAddDataModal } from '../../../../../actions/spaces'
import { fetchJobs, resetSpaceJobsFilters } from '../../../../../actions/spaces'
import SpaceJobsList from '../../../../components/Space/Jobs/SpaceJobsList'
import Button from '../../../../components/Button'
import Icon from '../../../../components/Icon'
import { getSpacePageTitle } from '../../../../../helpers/spaces'
import { SPACE_ADD_DATA_TYPES } from '../../../../../constants'


class SpaceJobsPage extends Component {
  loadSpaceJobs = () => {
    const { loadJobs, resetFilters, spaceId } = this.props
    resetFilters()
    loadJobs(spaceId)
  }

  componentDidMount() {
    if (!isEmpty(this.props.space)) {
      this.loadSpaceJobs()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.space !== this.props.space) {
      this.loadSpaceJobs()
    }
  }

  render() {
    const { spaceId, space, showAddAppsModal } = this.props
    const title = getSpacePageTitle('Jobs', space.isPrivate, space.isExclusive)

    return (
      <SpaceLayout spaceId={spaceId} space={space}>
        <div className="space-page-layout__header-row">
          <h2 className="space-page-layout__sub-title">{title}</h2>
          <div className="space-page-layout__actions">
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
          <SpaceJobsList />
        </div>

        <AddDataModal space={space} loadDataHandler={this.loadSpaceJobs} />
      </SpaceLayout>
    )
  }
}

SpaceJobsPage.propTypes = {
  spaceId: PropTypes.string,
  space: PropTypes.shape(SpaceShape),
  loadJobs: PropTypes.func,
  resetFilters: PropTypes.func,
  showAddAppsModal: PropTypes.func,
}

SpaceJobsPage.defaultProps = {
  loadJobs: () => {},
  resetFilters: () => {},
  showAddAppsModal: () => {},
}

const mapStateToProps = (state) => ({
  space: spaceDataSelector(state),
})

const mapDispatchToProps = dispatch => ({
  loadJobs: (spaceId) => dispatch(fetchJobs(spaceId)),
  resetFilters: () => dispatch(resetSpaceJobsFilters()),
  showAddAppsModal: () => dispatch(showSpaceAddDataModal(SPACE_ADD_DATA_TYPES.APPS)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaceJobsPage)

export {
  SpaceJobsPage,
}
