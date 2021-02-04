import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeWorkflowsShape from '../../../../shapes/HomeWorkflowsShape'
import { homeWorkflowsListSelector } from '../../../../../reducers/home/workflows/selectors'
import {
  fetchWorkflows,
  resetWorkflowsModals,
  resetWorkflowsFiltersValue,
  copyToSpaceWorkflows,
  setWorkflowFilterValue,
  workflowsAttachTo,
  deleteObjects,
} from '../../../../../actions/home'
import { OBJECT_TYPES } from '../../../../../constants'
import Icon from '../../../../components/Icon'
import Button from '../../../../components/Button'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeWorkflowsTable from '../../../../components/Home/Workflows/HomeWorkflowsTable'
import ActionsDropdown from '../../../../components/Home/Workflows/ActionsDropdown'
import {
  handleAddWorkflowClick,
} from '../HomeWorkflowsPage/helpers'


const HomeWorkflowsPage = (props) => {
  const { workflows = [], fetchWorkflows, resetWorkflowsModals, resetWorkflowsFiltersValue, setWorkflowFilterValue, copyToSpace, workflowsAttachTo, deleteWorkflows } = props

  useLayoutEffect(() => {
    resetWorkflowsModals()
    resetWorkflowsFiltersValue()
    fetchWorkflows()
  }, [])

  const handleFilterValue = (value) => {
    setWorkflowFilterValue(value)
    fetchWorkflows()
  }

  const checkedWorkflows = workflows.filter(workflow => workflow.isChecked)

  return (
    <HomeLayout>
      <div className="home-page-layout__header-row">
        <div className="home-page-layout__actions">
          <Button
            type="primary"
            onClick={handleAddWorkflowClick}
          >
            <span>
              <Icon icon="fa-plus" />
              &nbsp;
              Create Workflow
            </span>
          </Button>
        </div>
        <div className='home-page-layout__actions--right'>
          <ActionsDropdown
            workflows={checkedWorkflows}
            copyToSpace={copyToSpace}
            workflowsAttachTo={workflowsAttachTo}
            deleteWorkflows={(link, uids) => deleteWorkflows(link, uids)}
          />
        </div>
      </div>
      <div className="pfda-padded-t20">
        <HomeWorkflowsTable
          workflows={workflows}
          handleFilterValue={handleFilterValue}
        />
      </div>
    </HomeLayout>
  )
}

HomeWorkflowsPage.propTypes = {
  workflows: PropTypes.arrayOf(PropTypes.exact(HomeWorkflowsShape)),
  setWorkflowFilterValue: PropTypes.func,
  fetchWorkflows: PropTypes.func,
  resetWorkflowsModals: PropTypes.func,
  resetWorkflowsFiltersValue: PropTypes.func,
  isFetchingWorkflows: PropTypes.bool,
  copyToSpace: PropTypes.func,
  workflowsAttachTo: PropTypes.func,
  deleteWorkflows: PropTypes.func,
}

const mapStateToProps = (state) => ({
  workflows: homeWorkflowsListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchWorkflows: () => dispatch(fetchWorkflows()),
  resetWorkflowsModals: () => dispatch(resetWorkflowsModals()),
  resetWorkflowsFiltersValue: () => dispatch(resetWorkflowsFiltersValue()),
  setWorkflowFilterValue: (value) => dispatch(setWorkflowFilterValue(value)),
  copyToSpace: (scope, ids) => dispatch(copyToSpaceWorkflows(scope, ids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchWorkflows())
  }),
  workflowsAttachTo: (items, noteUids) => dispatch(workflowsAttachTo(items, noteUids)),
  deleteWorkflows: (link, uids) => dispatch(deleteObjects(link, OBJECT_TYPES.WORKFLOW, uids)).then(({ status }) => {
    if (status) dispatch(fetchWorkflows())
  }),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeWorkflowsPage)

export {
  HomeWorkflowsPage,
}
