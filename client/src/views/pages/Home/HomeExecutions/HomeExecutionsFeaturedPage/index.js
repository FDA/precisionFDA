import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  fetchExecutionsFeatured,
  resetExecutionsFeaturedFiltersValue,
  setExecutionsFeaturedFilterValue,
  copyToSpaceExecutions,
  executionsAttachTo,
  terminateExecutions,
  makeFeatured,
} from '../../../../../actions/home'
import {
  homeExecutionsFeaturedListSelector,
} from '../../../../../reducers/home/executions/selectors'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeExecutionsFeaturedTable from '../../../../components/Home/Executions/HomeExecutionsFeaturedTable'
import ActionsDropdown from '../../../../components/Home/Executions/ActionsDropdown'
import { OBJECT_TYPES } from '../../../../../constants'


const HomeExecutionsFeaturedPage = (props) => {
  const { executions = [], fetchExecutions, resetExecutionsFiltersValue, setExecutionsFilterValue, copyToSpace, attachTo, terminateExecutions, makeFeatured } = props

  useLayoutEffect(() => {
    resetExecutionsFiltersValue()
    fetchExecutions()
  }, [])

  const handleFilterValue = (value) => {
    setExecutionsFilterValue(value)
    fetchExecutions()
  }

  const checkedExecutions = executions.filter(e => e.isChecked)

  return (
    <HomeLayout>
      <div className='home-page-layout__header-row'>
        <div className='home-page-layout__actions--right'>
          <ActionsDropdown
            executions={checkedExecutions}
            page='featured'
            copyToSpace={copyToSpace}
            attachTo={attachTo}
            terminateExecutions={terminateExecutions}
            makeFeatured={makeFeatured}
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeExecutionsFeaturedTable executions={executions} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeExecutionsFeaturedPage.propTypes = {
  executions: PropTypes.array,
  fetchExecutions: PropTypes.func,
  resetExecutionsFiltersValue: PropTypes.func,
  setExecutionsFilterValue: PropTypes.func,
  copyToSpace: PropTypes.func,
  attachTo: PropTypes.func,
  terminateExecutions: PropTypes.func,
  makeFeatured: PropTypes.func,
}

const mapStateToProps = (state) => ({
  executions: homeExecutionsFeaturedListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchExecutions: () => dispatch(fetchExecutionsFeatured()),
  resetExecutionsFiltersValue: () => dispatch(resetExecutionsFeaturedFiltersValue()),
  setExecutionsFilterValue: (value) => dispatch(setExecutionsFeaturedFilterValue(value)),
  copyToSpace: (link, scope, ids) => dispatch(copyToSpaceExecutions(link, scope, ids)),
  attachTo: (items, noteUids) => dispatch(executionsAttachTo(items, noteUids)),
  terminateExecutions: (link, ids) => dispatch(terminateExecutions(link, ids)).then(({ status }) => {
    if (status) dispatch(fetchExecutionsFeatured())
  }),
  makeFeatured: (link, uids, featured) => dispatch(makeFeatured(link, OBJECT_TYPES.JOB, uids, featured)).then(({ status }) => {
    if (status === 200) dispatch(fetchExecutionsFeatured())
  }),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeExecutionsFeaturedPage)

export {
  HomeExecutionsFeaturedPage,
}
