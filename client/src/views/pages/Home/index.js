import React from 'react'
import PropTypes from 'prop-types'

import HomeAppsPage from './HomeAppsPage'
import HomeLayout from '../../layouts/HomeLayout'


const HomePage = ({ match }) => {
  const { page } = match.params
  
  switch (page) {
    case 'apps':
      return <HomeAppsPage />
    default:
      return <HomeLayout>Page not found</HomeLayout>
  }
}

HomePage.propTypes = {
  match: PropTypes.any,
}

export default HomePage
