import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import HomeAppShape from '../../../shapes/HomeAppShape'
import { homeAppsListSelector } from '../../../../reducers/home/apps/selectors'
import {
  fetchApps,
} from '../../../../actions/home'
import Icon from '../../../components/Icon'
import Button from '../../../components/Button'
import HomeLayout from '../../../layouts/HomeLayout'
import DropdownMenu from '../.././../components/DropdownMenu'
import HomeAppsTable from '../../../components/Home/Apps/HomeAppsTable'


const HomeAppsPage = ({ apps, fetchApps }) => {
  useLayoutEffect(() => {
    fetchApps()
  }, [])

  return (
    <HomeLayout>
      <div className='home-page-layout__header-row'>
        <div className='home-page-layout__actions'>
          <Link to='/home/apps/me'>
            <Button type='primary' >
              <span>
                <Icon icon='fa-cubes' />&nbsp;
                Create App
              </span>
            </Button>
          </Link>
        </div>
        <div className='home-page-layout__actions--right'>
          <DropdownMenu title='Actions' />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeAppsTable apps={apps} />
      </div>
    </HomeLayout>
  )
}

HomeAppsPage.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.exact(HomeAppShape)),
  fetchApps: PropTypes.func,
}

HomeAppsPage.defaultProps = {
  apps: [],
  fetchApps: () => { },
}

const mapStateToProps = (state) => ({
  apps: homeAppsListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchApps: () => dispatch(fetchApps()),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAppsPage)

export {
  HomeAppsPage,
}