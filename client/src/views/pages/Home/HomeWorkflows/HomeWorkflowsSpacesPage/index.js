import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeWorkflowsShape from '../../../../shapes/HomeWorkflowsShape'
import { homeWorkflowsSpacesListSelector } from '../../../../../reducers/home/workflows/selectors'
import {
  fetchWorkflowsSpaces,
  resetWorkflowsModals,
  resetWorkflowsSpacesFiltersValue,
  setWorkflowSpacesFilterValue,
  makeFeatured,
} from '../../../../../actions/home'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeWorkflowsSpacesTable from '../../../../components/Home/Workflows/HomeWorkflowsSpacesTable'
import ActionsDropdown from '../../../../components/Home/Workflows/ActionsDropdown'


const HomeWorkflowsSpacesPage = (props) => {
  const { workflows = [], fetchWorkflowsSpaces, resetWorkflowsModals, resetWorkflowsSpacesFiltersValue, setWorkflowSpacesFilterValue } = props

  useLayoutEffect(() => {
    resetWorkflowsModals()
    resetWorkflowsSpacesFiltersValue()
    fetchWorkflowsSpaces()
  }, [])

  const handleFilterValue = (value) => {
    setWorkflowSpacesFilterValue(value)
    fetchWorkflowsSpaces()
  }

  const checkedWorkflows = workflows.filter(workflow => workflow.isChecked)

  return (
    <HomeLayout>
      <div className="home-page-layout__header-row">
        <div className="home-page-layout__actions--right">
          <ActionsDropdown
            file={checkedWorkflows}
            workflows={checkedWorkflows}
            page='spaces'
            makeFeatured={makeFeatured}
          />
        </div>
      </div>
      <div className="pfda-padded-t20">
        <HomeWorkflowsSpacesTable
          workflows={workflows}
          handleFilterValue={handleFilterValue}
        />
      </div>
    </HomeLayout>
  )
}

HomeWorkflowsSpacesPage.propTypes = {
  workflows: PropTypes.arrayOf(PropTypes.exact(HomeWorkflowsShape)),
  fetchWorkflowsSpaces: PropTypes.func,
  resetWorkflowsModals: PropTypes.func,
  resetWorkflowsSpacesFiltersValue: PropTypes.func,
  isFetchingWorkflows: PropTypes.bool,
  setWorkflowSpacesFilterValue: PropTypes.func,
}

const mapStateToProps = (state) => ({
  workflows: homeWorkflowsSpacesListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchWorkflowsSpaces: () => dispatch(fetchWorkflowsSpaces()),
  resetWorkflowsModals: () => dispatch(resetWorkflowsModals()),
  resetWorkflowsSpacesFiltersValue: () => dispatch(resetWorkflowsSpacesFiltersValue()),
  setWorkflowSpacesFilterValue: (value) => dispatch(setWorkflowSpacesFilterValue(value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeWorkflowsSpacesPage)

export {
  HomeWorkflowsSpacesPage,
}
