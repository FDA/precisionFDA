import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import Tab from './Tab'
import TabShape from '../../shapes/TabShape'


const TabList = ({ tabs, padded }) => {
  const classes = classNames({
    'nav': true,
    'nav-tabs': true,
    'nav-tabs-padded': padded,
  })

  return (
    <div>
      <ul className={classes}>
        {tabs.map((tab, index) => <Tab tab={tab} key={index} />)}
      </ul>
    </div>
  )
}

TabList.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.exact(TabShape)).isRequired,
  padded: PropTypes.bool,
}

export default TabList
