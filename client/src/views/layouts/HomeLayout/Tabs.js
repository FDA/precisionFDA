import React, { useEffect, useState } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'

import { homeCurrentTabSelector, homePageCountersSelector } from '../../../reducers/home/page/selectors'
import { setCurrentTab, fetchCounters } from '../../../actions/home'
import { HOME_TABS } from '../../../constants'


const Tab = ({ url, text, tab, currentTab, setCurrentTab, isDisabled, ...rest }) => {
  const classes = classNames({
    'home-page-layout__tabs-item--disabled': isDisabled,
  }, 'home-page-layout__tabs-item')

  const onClick = (e) => {
    if (isDisabled) {
      e.preventDefault()
    } else {
      setCurrentTab(tab)
    }
  }

  return (
    <NavLink
      exact
      to={url}
      className={classes}
      activeClassName="home-page-layout__tabs-item--active"
      isActive={() => {
        return tab === currentTab
      }}
      onClick={onClick}
      {...rest}
    >
      <span>{text}</span>
    </NavLink>
  )
}

const Tabs = ({ match, currentTab, setCurrentTab, fetchCounters, counters, hideTabs }) => {
  const page = match.params.page

  useEffect(() => {
    if (!currentTab) {
      const tab = match.params.tab || 'private'
      const selectedTab = HOME_TABS[tab.toUpperCase()] || null
      setCurrentTab(selectedTab)
    }

    if (currentTab && !counters[currentTab].isFetched) fetchCounters(currentTab)
  }, [currentTab])

  // In progress - for spaces
  // eslint-disable-next-line  no-unused-vars
  const [privateTabDisable, setPrivateTabDisable] = useState(false)
  const [everybodyTabDisable, setEverybodyTabDisable] = useState(false)
  const [featuredTabDisable, setFeaturedTabDisable] = useState(false)
  const [spaceTabDisable, setSpaceTabDisable] = useState(false)
  useEffect(() => {
    if (page === 'databases') {
      setEverybodyTabDisable(true)
      setFeaturedTabDisable(true)
      setSpaceTabDisable(true)
    }
  }, [])

  if (hideTabs) return null

  return (
    <div className='home-page-layout__tabs'>
      <Tab
        url={`/home/${page}`}
        text='Me'
        tab={HOME_TABS.PRIVATE}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDisabled={privateTabDisable}
      />
      <Tab
        url={`/home/${page}/featured`}
        text='Featured'
        tab={HOME_TABS.FEATURED}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDisabled={featuredTabDisable}
      />
      <Tab
        url={`/home/${page}/everybody`}
        text='Everyone'
        tab={HOME_TABS.EVERYBODY}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDisabled={everybodyTabDisable}
      />
      <Tab
        url={`/home/${page}/spaces`}
        text='Spaces'
        tab={HOME_TABS.SPACES}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDisabled={spaceTabDisable}
      />
    </div>
  )
}

Tab.propTypes = {
  url: PropTypes.string,
  text: PropTypes.string,
  currentTab: PropTypes.string,
  tab: PropTypes.string,
  setCurrentTab: PropTypes.func,
  isDisabled: PropTypes.bool,
}

Tabs.propTypes = {
  match: PropTypes.object,
  currentTab: PropTypes.string,
  setCurrentTab: PropTypes.func,
  counters: PropTypes.object,
  fetchCounters: PropTypes.func,
  hideTabs: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  currentTab: homeCurrentTabSelector(state),
  counters: homePageCountersSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  setCurrentTab: (tab) => dispatch(setCurrentTab(tab)),
  fetchCounters: (tab) => dispatch(fetchCounters(tab)),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Tabs))
