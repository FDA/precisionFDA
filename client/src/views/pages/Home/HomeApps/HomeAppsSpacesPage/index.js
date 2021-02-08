import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeAppShape from '../../../../shapes/HomeAppShape'
import { homeAppsSpacesListSelector } from '../../../../../reducers/home/apps/selectors'
import {
  fetchAppsSpaces,
  resetAppsModals,
  resetAppsSpacesFiltersValue,
  setAppSpacesFilterValue,
  appsAttachTo,
  copyToSpaceApps,
} from '../../../../../actions/home'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeAppsSpacesTable from '../../../../components/Home/Apps/HomeAppsSpacesTable'
import ActionsDropdown from '../../../../components/Home/Apps/ActionsDropdown'


const HomeAppsSpacesPage = (props) => {
  const { apps = [], fetchAppsSpaces, resetAppsModals, resetAppsSpacesFiltersValue, setAppSpacesFilterValue, appsAttachTo, copyToSpace } = props

  useLayoutEffect(() => {
    resetAppsModals()
    resetAppsSpacesFiltersValue()
    fetchAppsSpaces()
  }, [])

  const handleFilterValue = (value) => {
    setAppSpacesFilterValue(value)
    fetchAppsSpaces()
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
            page='spaces'
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeAppsSpacesTable apps={apps} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeAppsSpacesPage.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.exact(HomeAppShape)),
  fetchAppsSpaces: PropTypes.func,
  resetAppsModals: PropTypes.func,
  resetAppsSpacesFiltersValue: PropTypes.func,
  setAppSpacesFilterValue: PropTypes.func,
  copyToSpace: PropTypes.func,
  appsAttachTo: PropTypes.func,
}

const mapStateToProps = (state) => ({
  apps: homeAppsSpacesListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchAppsSpaces: () => dispatch(fetchAppsSpaces()),
  resetAppsModals: () => dispatch(resetAppsModals()),
  resetAppsSpacesFiltersValue: () => dispatch(resetAppsSpacesFiltersValue()),
  setAppSpacesFilterValue: (value) => dispatch(setAppSpacesFilterValue(value)),
  copyToSpace: (scope, ids) => dispatch(copyToSpaceApps(scope, ids)).then(({ status }) => {
    if (status) dispatch(fetchAppsSpaces())
  }),
  appsAttachTo: (items, noteUids) => dispatch(appsAttachTo(items, noteUids)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAppsSpacesPage)

export {
  HomeAppsSpacesPage,
}