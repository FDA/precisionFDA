import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import SpaceShape from '../../../../shapes/SpaceShape'
import './style.sass'


const getTitle = (disabled, isLocked) => {
  if (disabled) return 'You have no access for this action'
  if (isLocked) return 'Unlock space'
  if (!isLocked) return 'Lock space'
}

const ToggleSwitch = ({ space, vertical, toggleHandler }) => {
  const { unlock, lock } = space.links

  const switchClasses = classNames({
    'toggle-switch': true,
    'toggle-switch--vertical': vertical,
    'toggle-switch--disabled': !space.hasLockLink,
  })
  const sliderClasses = classNames({
    'toggle-switch__slider': true,
    'toggle-switch__slider--locked': space.isLocked,
    'toggle-switch__slider--disabled': !space.hasLockLink,
  })

  const onClick = () => {
    if (!space.hasLockLink) return false
    const url = (space.isLocked) ? unlock : lock
    toggleHandler(space.id, url)
  }

  const title = getTitle(!space.hasLockLink, space.isLocked)

  return (
    <div className={switchClasses} onClick={onClick} title={title}>
      <span className={sliderClasses}></span>
    </div>
  )
}

export default ToggleSwitch

ToggleSwitch.propTypes = {
  space: PropTypes.exact(SpaceShape),
  vertical: PropTypes.bool,
  toggleHandler: PropTypes.func,
}
