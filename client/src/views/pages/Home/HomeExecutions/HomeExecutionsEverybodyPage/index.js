import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  fetchExecutionsEverybody,
  resetExecutionsEverybodyFiltersValue,
  setExecutionsEverybodyFilterValue,
  copyToSpaceExecutions,
  executionsAttachTo,
  terminateExecutions,
  makeFeatured,
} from '../../../../../actions/home'
import {
  homeExecutionsEverybodyListSelector,
} from '../../../../../reducers/home/executions/selectors'
import { OBJECT_TYPES } from '../../../../../constants'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeExecutionsEverybodyTable from '../../../../components/Home/Executions/HomeExecutionsEverybodyTable'
import ActionsDropdown from '../../../../components/Home/Executions/ActionsDropdown'


const HomeExecutionsEverybodyPage = (props) => {
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
            page='public'
            copyToSpace={copyToSpace}
            attachTo={attachTo}
            terminateExecutions={terminateExecutions}
            makeFeatured={makeFeatured}
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeExecutionsEverybodyTable executions={executions} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeExecutionsEverybodyPage.propTypes = {
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
  executions: homeExecutionsEverybodyListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchExecutions: () => dispatch(fetchExecutionsEverybody()),
  resetExecutionsFiltersValue: () => dispatch(resetExecutionsEverybodyFiltersValue()),
  setExecutionsFilterValue: (value) => dispatch(setExecutionsEverybodyFilterValue(value)),
  copyToSpace: (link, scope, ids) => dispatch(copyToSpaceExecutions(link, scope, ids)),
  attachTo: (items, noteUids) => dispatch(executionsAttachTo(items, noteUids)),
  terminateExecutions: (link, ids) => dispatch(terminateExecutions(link, ids)).then(({ status }) => {
    if (status) dispatch(fetchExecutionsEverybody())
  }),
  makeFeatured: (link, uids, featured) => dispatch(makeFeatured(link, OBJECT_TYPES.JOB, uids, featured)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeExecutionsEverybodyPage)

export {
  HomeExecutionsEverybodyPage,
}
