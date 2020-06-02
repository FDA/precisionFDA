import React from 'react'
import { Link, useRouteMatch } from 'react-router-dom'
import PropTypes from 'prop-types'

import Icon from '../Icon'
import TabShape from '../../shapes/TabShape'


const Tab = ({ tab }) => {
  const match = useRouteMatch({
    path: tab.url,
    exact: true,
  })

  return (
    <li className={match ? 'active' : ''}>
      <Link to={tab.url}>
        <Icon icon={tab.icon} fw />
        <span className="tab-label">{tab.title}</span>
      </Link>
    </li>
  )
}

Tab.propTypes = {
  tab: PropTypes.exact(TabShape).isRequired,
}

export default Tab
