import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeAppShape from '../../../../shapes/HomeAppShape'
import { homeAppsListSelector } from '../../../../../reducers/home/apps/selectors'
import {
  fetchApps,
  resetAppsModals,
  resetAppsFiltersValue,
  copyToSpaceApps,
  setAppFilterValue,
  appsAttachTo,
  deleteObjects,
} from '../../../../../actions/home'
import { OBJECT_TYPES } from '../../../../../constants'
import Icon from '../../../../components/Icon'
import Button from '../../../../components/Button'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeAppsTable from '../../../../components/Home/Apps/HomeAppsTable'
import ActionsDropdown from '../../../../components/Home/Apps/ActionsDropdown'


const HomeAppsPage = (props) => {
  const { apps = [], fetchApps, resetAppsModals, resetAppsFiltersValue, setAppFilterValue, copyToSpace, appsAttachTo, deleteApps } = props

  useLayoutEffect(() => {
    resetAppsModals()
    resetAppsFiltersValue()
    fetchApps()
  }, [])

  const handleFilterValue = (value) => {
    setAppFilterValue(value)
    fetchApps()
  }

  const checkedApps = apps.filter(app => app.isChecked)

  return (
    <HomeLayout>
      <div className='home-page-layout__header-row'>
        <div className='home-page-layout__actions'>
          <a href='/apps/new'>
            <Button type='primary'>
              <span>
                <Icon icon='fa-cubes' />&nbsp;
                Create App
              </span>
            </Button>
          </a>
        </div>
        <div className='home-page-layout__actions--right'>
          <ActionsDropdown
            apps={checkedApps}
            copyToSpace={copyToSpace}
            appsAttachTo={appsAttachTo}
            deleteApps={(link, uids) => deleteApps(link, uids)}
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeAppsTable apps={apps} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeAppsPage.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.exact(HomeAppShape)),
  fetchApps: PropTypes.func,
  resetAppsModals: PropTypes.func,
  resetAppsFiltersValue: PropTypes.func,
  setAppFilterValue: PropTypes.func,
  copyToSpace: PropTypes.func,
  appsAttachTo: PropTypes.func,
  deleteApps: PropTypes.func,
}

const mapStateToProps = (state) => ({
  apps: homeAppsListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchApps: () => dispatch(fetchApps()),
  resetAppsModals: () => dispatch(resetAppsModals()),
  resetAppsFiltersValue: () => dispatch(resetAppsFiltersValue()),
  copyToSpace: (scope, ids) => dispatch(copyToSpaceApps(scope, ids)).then(({ status }) => {
    if (status) dispatch(fetchApps())
  }),
  setAppFilterValue: (value) => dispatch(setAppFilterValue(value)),
  appsAttachTo: (items, noteUids) => dispatch(appsAttachTo(items, noteUids)),
  deleteApps: (link, uids) => dispatch(deleteObjects(link, OBJECT_TYPES.APP, uids)).then(({ status }) => {
    if (status) dispatch(fetchApps())
  }),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAppsPage)

export {
  HomeAppsPage,
}
