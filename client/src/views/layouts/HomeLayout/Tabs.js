import React from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'


const Tab = ({ url, text }) => (
  <NavLink
    to={url}
    className="home-page-layout__tabs-item"
    activeClassName="home-page-layout__tabs-item--active"
  >
    <span>{text}</span>
  </NavLink>
)

const Tabs = ({ location }) => {
  const page = location.pathname.split('/')[2]

  return (
    <div className='home-page-layout__tabs'>
      <Tab
        url={`/my_home/${page}/me`}
        text='Me'
      />
      <Tab
        url={`/my_home/${page}/featured`}
        text='Featured'
      />
      <Tab
        url={`/my_home/${page}/everybody`}
        text='Everybody'
      />
      <Tab
        url={`/my_home/${page}/spaces`}
        text='Spaces'
      />
    </div>
  )
}

Tab.propTypes = {
  url: PropTypes.string,
  text: PropTypes.string,
}

Tabs.propTypes = {
  location: PropTypes.object,
}

export default withRouter(props => <Tabs {...props} />)
