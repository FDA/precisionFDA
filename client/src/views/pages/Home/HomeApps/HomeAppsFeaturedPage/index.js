import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeAppShape from '../../../../shapes/HomeAppShape'
import { homeAppsFeaturedListSelector } from '../../../../../reducers/home/apps/selectors'
import {
  fetchAppsFeatured,
  resetAppsModals,
  resetAppsFeaturedFiltersValue,
  setAppFeaturedFilterValue,
  appsAttachTo,
  copyToSpaceApps,
  deleteObjects,
  makeFeatured,
} from '../../../../../actions/home'
import { OBJECT_TYPES } from '../../../../../constants'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeAppsFeaturedTable from '../../../../components/Home/Apps/HomeAppsFeaturedTable'
import ActionsDropdown from '../../../../components/Home/Apps/ActionsDropdown'


const HomeAppsFeaturedPage = (props) => {
  const { apps = [], fetchAppsFeatured, resetAppsModals, resetAppsFeaturedFiltersValue, setAppFeaturedFilterValue, appsAttachTo, copyToSpace, deleteApps, makeFeatured } = props

  useLayoutEffect(() => {
    resetAppsModals()
    resetAppsFeaturedFiltersValue()
    fetchAppsFeatured()
  }, [])

  const handleFilterValue = (value) => {
    setAppFeaturedFilterValue(value)
    fetchAppsFeatured()
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
            page='featured'
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeAppsFeaturedTable apps={apps} handleFilterValue={handleFilterValue}/>
      </div>
    </HomeLayout>
  )
}

HomeAppsFeaturedPage.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.exact(HomeAppShape)),
  fetchAppsFeatured: PropTypes.func,
  resetAppsModals: PropTypes.func,
  resetAppsFeaturedFiltersValue: PropTypes.func,
  setAppFeaturedFilterValue: PropTypes.func,
  copyToSpace: PropTypes.func,
  appsAttachTo: PropTypes.func,
  deleteApps: PropTypes.func,
  makeFeatured: PropTypes.func,
}

const mapStateToProps = (state) => ({
  apps: homeAppsFeaturedListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchAppsFeatured: () => dispatch(fetchAppsFeatured()),
  resetAppsModals: () => dispatch(resetAppsModals()),
  resetAppsFeaturedFiltersValue: () => dispatch(resetAppsFeaturedFiltersValue()),
  setAppFeaturedFilterValue: (value) => dispatch(setAppFeaturedFilterValue(value)),
  copyToSpace: (scope, ids) => dispatch(copyToSpaceApps(scope, ids)).then(({ status }) => {
    if (status) dispatch(fetchAppsFeatured())
  }),
  appsAttachTo: (items, noteUids) => dispatch(appsAttachTo(items, noteUids)),
  deleteApps: (link, uids) => dispatch(deleteObjects(link, OBJECT_TYPES.APP, uids)).then(({ status }) => {
    if (status) dispatch(fetchAppsFeatured())
  }),
  makeFeatured: (link, uids, featured) => dispatch(makeFeatured(link, OBJECT_TYPES.APP, uids, featured)).then(({ status }) => {
    if (status) dispatch(fetchAppsFeatured())
  }),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAppsFeaturedPage)

export {
  HomeAppsFeaturedPage,
}