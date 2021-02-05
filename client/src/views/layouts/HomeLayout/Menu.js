<<<<<<< HEAD
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


const MenuLink = ({ url, icon, text, counter = 0, page, currentPage, setCurrentPage, isDisabled }) => {
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
        {(!isNaN(counter)) && <span className='home-page-layout__menu-item-counter'>({counter})</span>}
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
=======
import React, { useState } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import Icon from '../../components/Icon'


const MenuLink = ({ url, icon, text, counter }) => (
  <NavLink
    to={url}
    className='home-page-layout__menu-item'
    activeClassName='home-page-layout__menu-item--active'
  >
    <Icon icon={icon} />
    <span className='home-page-layout__menu-item-text'>
      <span>{text}</span>
      {(!isNaN(counter)) && <span>({counter})</span>}
    </span>
  </NavLink>
)

const Menu = ({ match }) => {
  const [isHidden, setIsHidden] = useState(false)

  const tab = match.params.tab ? `/${match.params.tab}` : ''

  const classes = classNames({
    'home-page-layout__menu': true,
    'home-page-layout__menu--hidden': isHidden,
>>>>>>> production
  })

  const switcherClasses = classNames({
    'home-page-layout__menu-switcher': true,
  })

  return (
    <div className={classes}>
      <div className='home-page-layout__menu-items'>
        <MenuLink
          url={`/home/files${tab}`}
          icon={'fa-files-o'}
          text='Files'
<<<<<<< HEAD
          counter={counters.files}
          page={HOME_PAGES.FILES}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
=======
          counter={0}
>>>>>>> production
        />
        <MenuLink
          url={`/home/apps${tab}`}
          icon={'fa-cube'}
          text='Apps'
<<<<<<< HEAD
          counter={counters.apps}
          page={HOME_PAGES.APPS}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <MenuLink
          url={`/home/assets${tab}`}
          icon={'fa-file-zip-o'}
          text='Assets'
          counter={counters.assets}
          page={HOME_PAGES.ASSETS}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
=======
          counter={0}
        />
        <MenuLink
          url={`/home/assets${tab}`}
          icon={'fa-cube'}
          text='Assets'
          counter={0}
>>>>>>> production
        />
        <MenuLink
          url={`/home/workflows${tab}`}
          icon={'fa-bolt'}
          text='Workflows'
<<<<<<< HEAD
          counter={counters.workflows}
          page={HOME_PAGES.WORKFLOWS}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <MenuLink
          url={`/home/jobs${tab}`}
          icon={'fa-cogs'}
          text='Executions'
          counter={counters.jobs}
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
=======
          counter={0}
        />
        <MenuLink
          url={`/home/executions${tab}`}
          icon={'fa-cogs'}
          text='Executions'
          counter={0}
        />
        <MenuLink
          url={`/home/notes${tab}`}
          icon={'fa-sticky-note'}
          text='Notes'
          counter={0}
        />
      </div>
      <div className={switcherClasses} onClick={() => setIsHidden(!isHidden)}>
        {(!isHidden) && <Icon icon='fa-chevron-left' />}
        {(isHidden) && <Icon icon='fa-chevron-right' />}
      </div>
      <div className='home-page-layout__bottom-area' onClick={() => setIsHidden(!isHidden)}>
        {(!isHidden) && '<< Collapse sidebar'}
>>>>>>> production
      </div>
    </div>
  )
}

Menu.propTypes = {
<<<<<<< HEAD
  currentTab: PropTypes.string,
  currentPage: PropTypes.string,
  setCurrentPage: PropTypes.func,
  counters: PropTypes.object,
  match: PropTypes.object,
  isLeftMenuOpen: PropTypes.bool,
  setIsLeftMenuOpen: PropTypes.func,
=======
  match: PropTypes.object,
>>>>>>> production
}

MenuLink.propTypes = {
  url: PropTypes.string,
  icon: PropTypes.string,
  text: PropTypes.string,
  counter: PropTypes.number,
<<<<<<< HEAD
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
=======
}

export default withRouter(props => <Menu {...props}/>)
>>>>>>> production
