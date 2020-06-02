import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { isEmpty } from 'ramda'

import SpaceShape from '../../../../shapes/SpaceShape'
import WorkflowShape from '../../../../shapes/WorkflowShape'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import { spaceWorkflowsListSelector } from '../../../../../reducers/spaces/workflows/selectors'
import SpaceLayout from '../../../../layouts/SpaceLayout'
import AddDataModal from '../../../../components/Space/AddDataModal'
import CopyModal from '../../../../components/Space/Workflows/CopyModal'
import { showSpaceAddDataModal } from '../../../../../actions/spaces'
import { fetchWorkflows, resetSpaceWorkflowsFilters, showWorkflowsCopyModal } from '../../../../../actions/spaces'
import SpaceWorkflowsList from '../../../../components/Space/Workflows/SpaceWorkflowsList'
import Button from '../../../../components/Button'
import Icon from '../../../../components/Icon'
import { getSpacePageTitle } from '../../../../../helpers/spaces'
import { SPACE_ADD_DATA_TYPES } from '../../../../../constants'


class SpaceWorkflowsPage extends Component {
  loadSpaceWorkflows = () => {
    const { loadWorkflows, resetFilters, spaceId } = this.props
    resetFilters()
    loadWorkflows(spaceId)
  }

  componentDidMount() {
    if (!isEmpty(this.props.space)) {
      this.loadSpaceWorkflows()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.space !== this.props.space) {
      this.loadSpaceWorkflows()
    }
  }

  render() {
    const { spaceId, space, workflows, showAddWorkflowsModal, showCopyModal } = this.props
    const checkedWorkflows = workflows.filter(((workflow) => workflow.isChecked))
    const title = getSpacePageTitle('Workflows', space.isPrivate)

    return (
      <SpaceLayout spaceId={spaceId} space={space}>
        <div className="space-page-layout__header-row">
          <h2 className="space-page-layout__sub-title">{title}</h2>
          <div className="space-page-layout__actions">
            {(checkedWorkflows.length > 0) && (
              <Button type="primary" onClick={showCopyModal}>
                <span>
                  <Icon icon="fa-clone" />&nbsp;
                  Copy To Space
                </span>
              </Button>
            )}
            { space.links?.add_data &&
              <Button type="primary" onClick={showAddWorkflowsModal}>
                <span>
                  <Icon icon="fa-plus"/>&nbsp;
                  Add Workflows
                </span>
              </Button>
            }
          </div>
        </div>

        <div className="pfda-padded-t20">
          <SpaceWorkflowsList workflows={workflows} />
        </div>

        <AddDataModal space={space} loadDataHandler={this.loadSpaceWorkflows} />
        <CopyModal workflows={checkedWorkflows} loadFilesHandler={this.loadSpaceWorkflows} />
      </SpaceLayout>
    )
  }
}

SpaceWorkflowsPage.propTypes = {
  spaceId: PropTypes.string,
  space: PropTypes.shape(SpaceShape),
  workflows: PropTypes.arrayOf(PropTypes.exact(WorkflowShape)),
  loadWorkflows: PropTypes.func,
  resetFilters: PropTypes.func,
  showAddWorkflowsModal: PropTypes.func,
  showCopyModal: PropTypes.func,
}

SpaceWorkflowsPage.defaultProps = {
  workflows: [],
  loadWorkflows: () => {},
  resetFilters: () => {},
  showAddWorkflowsModal: () => {},
  showCopyModal: () => {},
}

const mapStateToProps = (state) => ({
  space: spaceDataSelector(state),
  workflows: spaceWorkflowsListSelector(state),
})

const mapDispatchToProps = dispatch => ({
  loadWorkflows: (spaceId) => dispatch(fetchWorkflows(spaceId)),
  resetFilters: () => dispatch(resetSpaceWorkflowsFilters()),
  showAddWorkflowsModal: () => dispatch(showSpaceAddDataModal(SPACE_ADD_DATA_TYPES.WORKFLOWS)),
  showCopyModal: () => dispatch(showWorkflowsCopyModal()),
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaceWorkflowsPage)

export {
  SpaceWorkflowsPage,
}
