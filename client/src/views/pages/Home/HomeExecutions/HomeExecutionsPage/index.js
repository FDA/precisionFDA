import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  resetExecutionsFiltersValue,
  setExecutionsFilterValue,
  copyToSpaceExecutions,
  executionsAttachTo,
  terminateExecutions,
} from '../../../../../actions/home'
import {
  homeExecutionsListSelector,
} from '../../../../../reducers/home/executions/selectors'
import { fetchExecutions } from '../../../../../actions/home'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeExecutionsTable from '../../../../components/Home/Executions/HomeExecutionsTable'
import ActionsDropdown from '../../../../components/Home/Executions/ActionsDropdown'


const HomeExecutionsPage = (props) => {
  const { executions = [], fetchExecutions, resetExecutionsFiltersValue, setExecutionsFilterValue, copyToSpace, attachTo, terminateExecutions } = props

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
            page='private'
            copyToSpace={copyToSpace}
            attachTo={attachTo}
            terminateExecutions={terminateExecutions}
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeExecutionsTable executions={executions} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeExecutionsPage.propTypes = {
  executions: PropTypes.array,
  fetchExecutions: PropTypes.func,
  resetExecutionsFiltersValue: PropTypes.func,
  setExecutionsFilterValue: PropTypes.func,
  copyToSpace: PropTypes.func,
  attachTo: PropTypes.func,
  terminateExecutions: PropTypes.func,
}

const mapStateToProps = (state) => ({
  executions: homeExecutionsListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchExecutions: () => dispatch(fetchExecutions()),
  resetExecutionsFiltersValue: () => dispatch(resetExecutionsFiltersValue()),
  setExecutionsFilterValue: (value) => dispatch(setExecutionsFilterValue(value)),
  copyToSpace: (link, scope, ids) => dispatch(copyToSpaceExecutions(link, scope, ids)),
  attachTo: (items, noteUids) => dispatch(executionsAttachTo(items, noteUids)),
  terminateExecutions: (link, ids) => dispatch(terminateExecutions(link, ids)).then(({ status }) => {
    if (status) dispatch(fetchExecutions())
  }),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeExecutionsPage)

export {
  HomeExecutionsPage,
}
