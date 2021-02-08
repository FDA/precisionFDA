import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeWorkflowsShape from '../../../../shapes/HomeWorkflowsShape'
import {
  homeWorkflowsEveryoneListSelector,
} from '../../../../../reducers/home/workflows/selectors'
import {
  fetchWorkflowsEveryone,
  resetWorkflowsModals,
  resetWorkflowsEveryoneFiltersValue,
  setWorkflowEveryoneFilterValue,
} from '../../../../../actions/home'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeWorkflowsEveryoneTable from '../../../../components/Home/Workflows/HomeWorkflowsEveryoneTable'
import ActionsDropdown from '../../../../components/Home/Workflows/ActionsDropdown'
import {
  checkedWorkflows,
} from '../HomeWorkflowsPage/helpers'


const HomeWorkflowsEveryonePage = (props) => {
  const { workflows = [], fetchWorkflowsEveryone, resetWorkflowsModals, resetWorkflowsEveryoneFiltersValue, setWorkflowEveryoneFilterValue, makeFeatured } = props

  useLayoutEffect(() => {
    resetWorkflowsModals()
    resetWorkflowsEveryoneFiltersValue()
    fetchWorkflowsEveryone()
  }, [])

  const handleFilterValue = (value) => {
    setWorkflowEveryoneFilterValue(value)
    fetchWorkflowsEveryone()
  }

  return (
    <HomeLayout>
      <div className="home-page-layout__header-row">
        <div className="home-page-layout__actions--right">
          <ActionsDropdown
            file={checkedWorkflows}
            page='public'
            makeFeatured={makeFeatured}
          />
        </div>
      </div>
      <div className="pfda-padded-t20">
        <HomeWorkflowsEveryoneTable
          workflows={workflows}
          handleFilterValue={handleFilterValue}
        />
      </div>
    </HomeLayout>
  )
}

HomeWorkflowsEveryonePage.propTypes = {
  workflows: PropTypes.arrayOf(PropTypes.exact(HomeWorkflowsShape)),
  fetchWorkflowsEveryone: PropTypes.func,
  resetWorkflowsModals: PropTypes.func,
  resetWorkflowsFiltersValue: PropTypes.func,
  isFetchingWorkflows: PropTypes.bool,
  setWorkflowEveryoneFilterValue: PropTypes.func,
  resetWorkflowsEveryoneFiltersValue: PropTypes.func,
  makeFeatured: PropTypes.func,
}

const mapStateToProps = (state) => ({
  workflows: homeWorkflowsEveryoneListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchWorkflowsEveryone: () => dispatch(fetchWorkflowsEveryone()),
  resetWorkflowsModals: () => dispatch(resetWorkflowsModals()),
  resetWorkflowsEveryoneFiltersValue: () => dispatch(resetWorkflowsEveryoneFiltersValue()),
  setWorkflowEveryoneFilterValue: (value) => dispatch(setWorkflowEveryoneFilterValue(value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeWorkflowsEveryonePage)

export {
  HomeWorkflowsEveryonePage,
}

