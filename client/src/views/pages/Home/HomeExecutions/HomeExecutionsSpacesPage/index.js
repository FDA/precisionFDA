import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  resetExecutionsSpacesFiltersValue,
  setExecutionsSpacesFilterValue,
  copyToSpaceExecutions,
  executionsAttachTo,
  terminateExecutions,
} from '../../../../../actions/home'
import {
  homeExecutionsSpacesListSelector,
} from '../../../../../reducers/home/executions/selectors'
import { fetchExecutionsSpaces } from '../../../../../actions/home'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeExecutionsSpacesTable from '../../../../components/Home/Executions/HomeExecutionsSpacesTable'
import ActionsDropdown from '../../../../components/Home/Executions/ActionsDropdown'


const HomeExecutionsSpacesPage = (props) => {
  const { executions = [], fetchExecutionsSpaces, resetExecutionsSpacesFiltersValue, setExecutionsSpacesFilterValue, copyToSpace, attachTo, terminateExecutions } = props

  useLayoutEffect(() => {
    resetExecutionsSpacesFiltersValue()
    fetchExecutionsSpaces()
  }, [])

  const handleFilterValue = (value) => {
    setExecutionsSpacesFilterValue(value)
    fetchExecutionsSpaces()
  }

  const checkedExecutions = executions.filter(e => e.isChecked)

  return (
    <HomeLayout>
      <div className='home-page-layout__header-row'>
        <div className='home-page-layout__actions--right'>
          <ActionsDropdown
            executions={checkedExecutions}
            page='spaces'
            copyToSpace={copyToSpace}
            attachTo={attachTo}
            terminateExecutions={terminateExecutions}
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeExecutionsSpacesTable executions={executions} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeExecutionsSpacesPage.propTypes = {
  executions: PropTypes.array,
  fetchExecutionsSpaces: PropTypes.func,
  resetExecutionsSpacesFiltersValue: PropTypes.func,
  setExecutionsSpacesFilterValue: PropTypes.func,
  copyToSpace: PropTypes.func,
  attachTo: PropTypes.func,
  terminateExecutions: PropTypes.func,
}

const mapStateToProps = (state) => ({
  executions: homeExecutionsSpacesListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchExecutionsSpaces: () => dispatch(fetchExecutionsSpaces()),
  resetExecutionsSpacesFiltersValue: () => dispatch(resetExecutionsSpacesFiltersValue()),
  setExecutionsSpacesFilterValue: (value) => dispatch(setExecutionsSpacesFilterValue(value)),
  copyToSpace: (link, scope, ids) => dispatch(copyToSpaceExecutions(link, scope, ids)),
  attachTo: (items, noteUids) => dispatch(executionsAttachTo(items, noteUids)),
  terminateExecutions: (link, ids) => dispatch(terminateExecutions(link, ids)).then(({ status }) => {
    if (status) dispatch(fetchExecutionsSpaces())
  }),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeExecutionsSpacesPage)

export {
  HomeExecutionsSpacesPage,
}
