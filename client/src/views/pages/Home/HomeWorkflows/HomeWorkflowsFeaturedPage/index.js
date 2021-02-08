import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeWorkflowsShape from '../../../../shapes/HomeWorkflowsShape'
import {
  homeWorkflowsFeaturedListSelector,
  homeWorkflowsFeaturedIsFetchWorkflowsSelector,
} from '../../../../../reducers/home/workflows/selectors'
import {
  fetchWorkflowsFeatured,
  resetWorkflowsModals,
  resetWorkflowsFeaturedFiltersValue,
  setWorkflowFeaturedFilterValue,
  makeFeatured,
} from '../../../../../actions/home'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeWorkflowsTable from '../../../../components/Home/Workflows/HomeWorkflowsFeaturedTable'
import ActionsDropdown from '../../../../components/Home/Workflows/ActionsDropdown'
import { checkedWorkflows } from '../HomeWorkflowsPage/helpers'


const HomeWorkflowsFeaturedPage = (props) => {
  const { workflows = [], fetchWorkflowsFeatured, resetWorkflowsModals, resetWorkflowsFeaturedFiltersValue, setWorkflowFeaturedFilterValue } = props

  useLayoutEffect(() => {
    resetWorkflowsModals()
    resetWorkflowsFeaturedFiltersValue()
    fetchWorkflowsFeatured()
  }, [])

  const handleFilterValue = (value) => {
    setWorkflowFeaturedFilterValue(value)
    fetchWorkflowsFeatured()
  }

  return (
    <HomeLayout>
      <div className="home-page-layout__header-row">
        <div className="home-page-layout__actions--right">
          <ActionsDropdown
            file={checkedWorkflows}
            page='featured'
            makeFeatured={makeFeatured}
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

HomeWorkflowsFeaturedPage.propTypes = {
  workflows: PropTypes.arrayOf(PropTypes.exact(HomeWorkflowsShape)),
  fetchWorkflowsFeatured: PropTypes.func,
  resetWorkflowsModals: PropTypes.func,
  resetWorkflowsFeaturedFiltersValue: PropTypes.func,
  setWorkflowFeaturedFilterValue: PropTypes.func,
}

const mapStateToProps = (state) => ({
  workflows: homeWorkflowsFeaturedListSelector(state),
  isFetchingWorkflows: homeWorkflowsFeaturedIsFetchWorkflowsSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchWorkflowsFeatured: () => dispatch(fetchWorkflowsFeatured()),
  resetWorkflowsModals: () => dispatch(resetWorkflowsModals()),
  resetWorkflowsFeaturedFiltersValue: () => dispatch(resetWorkflowsFeaturedFiltersValue()),
  setWorkflowFeaturedFilterValue: (value) => dispatch(setWorkflowFeaturedFilterValue(value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeWorkflowsFeaturedPage)


export { HomeWorkflowsFeaturedPage }
