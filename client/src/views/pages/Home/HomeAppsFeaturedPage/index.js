import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeAppShape from '../../../shapes/HomeAppShape'
import { homeAppsFeaturedListSelector } from '../../../../reducers/home/apps/selectors'
import {
  fetchAppsFeatured,
} from '../../../../actions/home'
import HomeLayout from '../../../layouts/HomeLayout'
import DropdownMenu from '../.././../components/DropdownMenu'
import HomeAppsFeaturedTable from '../../../components/Home/Apps/HomeAppsFeaturedTable'


const HomeAppsFeaturedPage = ({ apps, fetchAppsFeatured }) => {
  useLayoutEffect(() => {
    fetchAppsFeatured()
  }, [])

  return (
    <HomeLayout>
      <div className='home-page-layout__header-row'>
        <div className='home-page-layout__actions--right'>
          <DropdownMenu title='Actions' />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeAppsFeaturedTable apps={apps} />
      </div>
    </HomeLayout>
  )
}

HomeAppsFeaturedPage.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.exact(HomeAppShape)),
  fetchAppsFeatured: PropTypes.func,
}

HomeAppsFeaturedPage.defaultProps = {
  apps: [],
  fetchAppsFeatured: () => { },
}

const mapStateToProps = (state) => ({
  apps: homeAppsFeaturedListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchAppsFeatured: () => dispatch(fetchAppsFeatured()),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAppsFeaturedPage)

export {
  HomeAppsFeaturedPage,
}