import React from 'react'
import PropTypes from 'prop-types'

import HomeAppsPage from './HomeAppsPage'
import HomeAppsFeaturedPage from './HomeAppsFeaturedPage'
import HomeLayout from '../../layouts/HomeLayout'


const HomePage = ({ match }) => {
  const { page } = match.params
  const tab = match.params.tab ? `/${match.params.tab}` : ''

  switch (page + tab) {
    case 'apps':
      return <HomeAppsPage />
    case 'apps/featured':
      return <HomeAppsFeaturedPage />
    default:
      return <HomeLayout>Page not found</HomeLayout>
  }
}

HomePage.propTypes = {
  match: PropTypes.any,
}

export default HomePage
