import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import './style.sass'


const DatabaseTypeSwitch = ({
    name,
    checked,
    disabled,
    value,
    label,
    description,
    defaultChecked,
    ...rest
  }) => {

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

  const descriptionClasses = {
    'space-type-switch__description': true,
    'space-type-switch__description--disabled': disabled,
  }

  return (
    <div className="space-type-switch">
      <div className={containerClasses}>
        <div className="space-type-switch__box">
          <div className="space-type-switch__radio">
            {checked && <div className={classNames(dotClasses)} />}
          </div>
          <div>
            <div className={classNames(labelClasses)}>{label}</div>
            {description && <div className={classNames(descriptionClasses)}>{description}</div>}
          </div>
        </div>
      </div>
      <input
        type="radio"
        value={value}
        checked={checked}
        disabled={disabled}
        defaultChecked={defaultChecked}
        name={name}
        {...rest}
      />
    </div>
  )
}

DatabaseTypeSwitch.propTypes = {
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  description: PropTypes.any,
  defaultChecked: PropTypes.bool,
}

export default DatabaseTypeSwitch
