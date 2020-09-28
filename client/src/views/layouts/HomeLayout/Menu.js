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
          counter={0}
        />
        <MenuLink
          url={`/home/apps${tab}`}
          icon={'fa-cube'}
          text='Apps'
          counter={0}
        />
        <MenuLink
          url={`/home/assets${tab}`}
          icon={'fa-cube'}
          text='Assets'
          counter={0}
        />
        <MenuLink
          url={`/home/workflows${tab}`}
          icon={'fa-bolt'}
          text='Workflows'
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
      </div>
    </div>
  )
}

Menu.propTypes = {
  match: PropTypes.object,
}

MenuLink.propTypes = {
  url: PropTypes.string,
  icon: PropTypes.string,
  text: PropTypes.string,
  counter: PropTypes.number,
}

export default withRouter(props => <Menu {...props}/>)