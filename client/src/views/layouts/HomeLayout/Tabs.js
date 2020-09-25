import React from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'


const Tab = ({ url, text }) => (
  <NavLink
    exact
    to={url}
    className="home-page-layout__tabs-item"
    activeClassName="home-page-layout__tabs-item--active"
  >
    <span>{text}</span>
  </NavLink>
)

const Tabs = ({ match }) => {
  const page = match.params.page

  return (
    <div className='home-page-layout__tabs'>
      <Tab
        url={`/home/${page}`}
        text='Me'
      />
      <Tab
        url={`/home/${page}/featured`}
        text='Featured'
      />
      <Tab
        url={`/home/${page}/everybody`}
        text='Everybody'
      />
      <Tab
        url={`/home/${page}/spaces`}
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
  match: PropTypes.object,
}

export default withRouter(props => <Tabs {...props} />)
