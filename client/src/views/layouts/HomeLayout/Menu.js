import React, { useEffect } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { connect } from 'react-redux'

import Icon from '../../components/Icon'
import {
  homeCurrentTabSelector,
  homeCurrentPageSelector,
  homePageCountersSelector,
  homeIsLeftMenuOpenSelector,
} from '../../../reducers/home/page/selectors'
import { HOME_TABS, HOME_PAGES } from '../../../constants'
import { setCurrentPage, setIsLeftMenuOpen } from '../../../actions/home'


const MenuLink = ({ url, icon, text, counter, page, currentPage, setCurrentPage, isDisabled }) => {
  const classes = classNames({
    'home-page-layout__menu-item--disabled': isDisabled,
  }, 'home-page-layout__menu-item')

  const onClick = (e) => {
    if (isDisabled) {
      e.preventDefault()
    } else {
      setCurrentPage(page)
    }
  }

  return (
    <NavLink
      to={url}
      className={classes}
      activeClassName='home-page-layout__menu-item--active'
      isActive={() => {
        return page === currentPage
      }}
      onClick={onClick}
    >
      <Icon icon={icon} />
      <span className='home-page-layout__menu-item-text'>
        <span>{text}</span>
        <span className='home-page-layout__menu-item-counter'>({counter})</span>
      </span>
    </NavLink>
  )
}


const Menu = ({ currentTab, currentPage, setCurrentPage, counters = {}, match, isLeftMenuOpen, setIsLeftMenuOpen }) => {
  const page = match.params.page
  useEffect(() => {
    if (page && HOME_PAGES[page.toUpperCase()]) {
      setCurrentPage(HOME_PAGES[page.toUpperCase()])
    }
  }, [page])

  const tab = currentTab && currentTab !== HOME_TABS.PRIVATE ? `/${currentTab.toLowerCase()}` : ''

  const classes = classNames({
    'home-page-layout__menu': true,
    'home-page-layout__menu--hidden': !isLeftMenuOpen,
  })

  const switcherClasses = classNames({
    'home-page-layout__menu-switcher': true,
  })

  const tabCounters = counters[currentTab] || {}

  return (
    <div className={classes}>
      <div className='home-page-layout__menu-items'>
        <MenuLink
          url={`/home/files${tab}`}
          icon={'fa-files-o'}
          text='Files'
          counter={tabCounters.files}
          page={HOME_PAGES.FILES}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <MenuLink
          url={`/home/apps${tab}`}
          icon={'fa-cube'}
          text='Apps'
          counter={tabCounters.apps}
          page={HOME_PAGES.APPS}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <MenuLink
          url={`/home/databases${tab}`}
          icon={'fa-cube'}
          text='Databases'
          counter={tabCounters.dbclusters}
          page={HOME_PAGES.DATABASES}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <MenuLink
          url={`/home/assets${tab}`}
          icon={'fa-file-zip-o'}
          text='Assets'
          counter={tabCounters.assets}
          page={HOME_PAGES.ASSETS}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <MenuLink
          url={`/home/workflows${tab}`}
          icon={'fa-bolt'}
          text='Workflows'
          counter={tabCounters.workflows}
          page={HOME_PAGES.WORKFLOWS}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <MenuLink
          url={`/home/jobs${tab}`}
          icon={'fa-cogs'}
          text='Executions'
          counter={tabCounters.jobs}
          page={HOME_PAGES.JOBS}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
      <div className={switcherClasses} onClick={() => setIsLeftMenuOpen(!isLeftMenuOpen)}>
        {(isLeftMenuOpen) && <Icon icon='fa-chevron-left' />}
        {(!isLeftMenuOpen) && <Icon icon='fa-chevron-right' />}
      </div>
      <div className='home-page-layout__bottom-area' onClick={() => setIsLeftMenuOpen(!isLeftMenuOpen)}>
        {(isLeftMenuOpen) && '<< Collapse sidebar'}
      </div>
    </div>
  )
}

Menu.propTypes = {
  currentTab: PropTypes.string,
  currentPage: PropTypes.string,
  setCurrentPage: PropTypes.func,
  counters: PropTypes.object,
  match: PropTypes.object,
  isLeftMenuOpen: PropTypes.bool,
  setIsLeftMenuOpen: PropTypes.func,
}

MenuLink.propTypes = {
  url: PropTypes.string,
  icon: PropTypes.string,
  text: PropTypes.string,
  counter: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  page: PropTypes.string,
  currentPage: PropTypes.string,
  setCurrentPage: PropTypes.func,
  isDisabled: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  currentTab: homeCurrentTabSelector(state),
  currentPage: homeCurrentPageSelector(state),
  counters: homePageCountersSelector(state),
  isLeftMenuOpen: homeIsLeftMenuOpenSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  setCurrentPage: (page) => dispatch(setCurrentPage(page)),
  setIsLeftMenuOpen: (value) => dispatch(setIsLeftMenuOpen(value)),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Menu))
