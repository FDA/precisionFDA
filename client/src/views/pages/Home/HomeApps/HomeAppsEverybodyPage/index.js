import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeAppShape from '../../../../shapes/HomeAppShape'
import { homeAppsEverybodyListSelector } from '../../../../../reducers/home/apps/selectors'
import {
  fetchAppsEverybody,
  resetAppsModals,
  resetAppsEverybodyFiltersValue,
  setAppEverybodyFilterValue,
  appsAttachTo,
  copyToSpaceApps,
  deleteObjects,
  makeFeatured,
} from '../../../../../actions/home'
import { OBJECT_TYPES } from '../../../../../constants'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeAppsEverybodyTable from '../../../../components/Home/Apps/HomeAppsEverybodyTable'
import ActionsDropdown from '../../../../components/Home/Apps/ActionsDropdown'


const HomeAppsEverybodyPage = (props) => {
  const { apps = [], fetchAppsEverybody, resetAppsModals, resetAppsEverybodyFiltersValue, setAppEverybodyFilterValue, appsAttachTo, copyToSpace, deleteApps, makeFeatured } = props

  useLayoutEffect(() => {
    resetAppsModals()
    resetAppsEverybodyFiltersValue()
    fetchAppsEverybody()
  }, [])

  const handleFilterValue = (value) => {
    setAppEverybodyFilterValue(value)
    fetchAppsEverybody()
  }

  const checkedApps = apps.filter(app => app.isChecked)

  return (
    <HomeLayout>
      <div className='home-page-layout__header-row'>
        <div className='home-page-layout__actions--right'>
          <ActionsDropdown
            apps={checkedApps}
            copyToSpace={copyToSpace}
            appsAttachTo={appsAttachTo}
            deleteApps={(link, uids) => deleteApps(link, uids)}
            makeFeatured={makeFeatured}
            page='public'
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeAppsEverybodyTable apps={apps} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeAppsEverybodyPage.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.exact(HomeAppShape)),
  fetchAppsEverybody: PropTypes.func,
  resetAppsModals: PropTypes.func,
  resetAppsEverybodyFiltersValue: PropTypes.func,
  setAppEverybodyFilterValue: PropTypes.func,
  copyToSpace: PropTypes.func,
  appsAttachTo: PropTypes.func,
  deleteApps: PropTypes.func,
  makeFeatured: PropTypes.func,
}

const mapStateToProps = (state) => ({
  apps: homeAppsEverybodyListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchAppsEverybody: () => dispatch(fetchAppsEverybody()),
  resetAppsModals: () => dispatch(resetAppsModals()),
  resetAppsEverybodyFiltersValue: () => dispatch(resetAppsEverybodyFiltersValue()),
  setAppEverybodyFilterValue: (value) => dispatch(setAppEverybodyFilterValue(value)),
  copyToSpace: (scope, ids) => dispatch(copyToSpaceApps(scope, ids)).then(({ status }) => {
    if (status) dispatch(fetchAppsEverybody())
  }),
  appsAttachTo: (items, noteUids) => dispatch(appsAttachTo(items, noteUids)),
  deleteApps: (link, uids) => dispatch(deleteObjects(link, OBJECT_TYPES.APP, uids)).then(({ status }) => {
    if (status) dispatch(fetchAppsEverybody())
  }),
  makeFeatured: (link, uids, featured) => dispatch(makeFeatured(link, OBJECT_TYPES.APP, uids, featured)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAppsEverybodyPage)

export {
  HomeAppsEverybodyPage,
}