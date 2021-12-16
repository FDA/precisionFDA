import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import SpaceShape from '../../../../shapes/SpaceShape'
import ToggleSwitch from '../ToggleSwitch'


const Switcher = ({ space, lockToggleHandler }) => {
  const classes = classNames({
    'spaces-list-card-switcher': true,
    'spaces-list-card-switcher--active': !space.isLocked,
    'spaces-list-card-switcher--locked': space.isLocked,
  })

  const statusClasses = classNames(
    'spaces-list-card-switcher__status',
    `spaces-list-card-switcher__status--${space.status}`,
    `remediation-card-switcher-${space.status}`,
  )

  if (!space.hasLockLink) {
    return (
      <div className={classes}>
        <div className={statusClasses}>{space.status}</div>
      </div>
    )
  }

  return (
    <div className={classes}>
      <div className="spaces-list-card-switcher__status spaces-list-card-switcher__status--active remediation-card-switcher-active">active</div>
      <div className="spaces-list-card-switcher__toggle">
        <ToggleSwitch space={space} toggleHandler={lockToggleHandler} />
      </div>
      <div className="spaces-list-card-switcher__status spaces-list-card-switcher__status--locked remediation-card-switcher-locked">locked</div>
    </div>
  )
}

export default Switcher

Switcher.propTypes = {
  space: PropTypes.exact(SpaceShape),
  lockToggleHandler: PropTypes.func,
}
