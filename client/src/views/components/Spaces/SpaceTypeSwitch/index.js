import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import './style.sass'


const SpaceTypeSwitch = ({ name, checked, disabled, label, ...rest }) => {
  const containerClasses = classNames('space-type-switch__container', {
    'space-type-switch__container--checked': checked,
    'space-type-switch__container--disabled': disabled,
  })

  const dotClasses = {
    'space-type-switch__dot': true,
    'space-type-switch__dot--disabled': disabled,
  }

  const labelClasses = {
    'space-type-switch__label': true,
    'space-type-switch__label--disabled': disabled,
  }

  return (
    <div className="space-type-switch">
      <div className={containerClasses}>
        <div className="space-type-switch__box">
          <div className="space-type-switch__radio">
            {checked && <div className={classNames(dotClasses)} />}
          </div>
          <span className={classNames(labelClasses)}>{label}</span>
        </div>
      </div>
      <input type="radio" checked={checked} disabled={disabled} name={name} {...rest} />
    </div>
  )
}

SpaceTypeSwitch.propTypes = {
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
}

export default SpaceTypeSwitch
