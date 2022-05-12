import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { useDispatch, useSelector } from 'react-redux'

import SpaceShape from '../../shapes/SpaceShape'
import { getSpacesIcon } from '../../../helpers/spaces'
import Icon from '../../components/Icon'
import { isSideMenuHiddenSelector } from '../../../reducers/spaces/space/selectors'
import { spaceSideMenuToggle } from '../../../actions/spaces'
// eslint-disable-next-line
import { SPACE_GROUPS, SPACE_PRIVATE_TYPE, SPACE_REVIEW, SPACE_GOVERNMENT } from '../../../constants'

const MenuLink = ({ url, icon, text, counter }) => (
  <NavLink
    to={url}
    className="space-page-layout__menu-item"
    activeClassName="space-page-layout__menu-item--active"
  >
    <Icon icon={icon} />
    <span className="space-page-layout__menu-item-text">
      <span>{text}</span>
      {!isNaN(counter) && <span>({counter})</span>}
    </span>
  </NavLink>
)

const Menu = ({ space }) => {
  const dispatch = useDispatch()
  const toggleMenu = () => dispatch(spaceSideMenuToggle())

  const isHidden = useSelector(isSideMenuHiddenSelector)

  const classes = classNames({
    'space-page-layout__menu': true,
    'space-page-layout__menu--shared':
      !space.isPrivate & (space.type !== SPACE_PRIVATE_TYPE),
    'space-page-layout__menu--exclusive': space.type === SPACE_PRIVATE_TYPE,
    'space-page-layout__menu--hidden': isHidden,
  })

  const switcherClasses = classNames({
    'space-page-layout__menu-switcher': true,
    'space-page-layout__menu-switcher--shared': !space.isPrivate,
  })

  return (
    <div className={classes}>
      <div className="space-page-layout__menu-items">
        <MenuLink
          url={`/spaces/${space.id}/files`}
          icon={getSpacesIcon('files')}
          text="Files"
          counter={space.counters.files}
        />
        <MenuLink
          url={`/spaces/${space.id}/apps`}
          icon={getSpacesIcon('apps')}
          text="Apps"
          counter={space.counters.apps}
        />
        <MenuLink
          url={`/spaces/${space.id}/workflows`}
          icon={getSpacesIcon('workflows')}
          text="Workflows"
          counter={space.counters.workflows}
        />
        <MenuLink
          url={`/spaces/${space.id}/jobs`}
          icon={getSpacesIcon('jobs')}
          text="Jobs"
          counter={space.counters.jobs}
        />
        {[SPACE_GROUPS, SPACE_REVIEW, SPACE_GOVERNMENT].includes(space.type) && (
          <MenuLink
            url={`/spaces/${space.id}/members`}
            icon={getSpacesIcon('members')}
            text="Members"
            counter={space.counters.members}
          />
        )}
      </div>
      <div className={switcherClasses} onClick={toggleMenu}>
        {!isHidden && <Icon icon="fa-chevron-left" />}
        {isHidden && <Icon icon="fa-chevron-right" />}
      </div>
    </div>
  )
}

export default Menu

Menu.propTypes = {
  space: PropTypes.shape(SpaceShape),
}

MenuLink.propTypes = {
  url: PropTypes.string,
  icon: PropTypes.string,
  text: PropTypes.string,
  counter: PropTypes.number,
}
