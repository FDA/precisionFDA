import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { ALERT_STYLES } from '../../../../constants'


const Radio = ({ name, label, options, initialValue, status, inline, ...rest }) => {
  const rowClasses = { 'col': true }
  return (
    <div className={classNames('form-group', 'required', 'row', { [`has-${status}`]: status })}>
      {label && <div className={classNames('col-form-label', rowClasses)}><label>{label}</label></div>}
      <div className={classNames(rowClasses)}>
        {options.map(option => (
          <div className={classNames('form-check', { 'form-check-inline': inline })} key={option.value}>
            <input className="form-check-input" htmlFor={option.htmlFor ? option.htmlFor : option.value} aria-label={`for Input ${option.ariaLabel}`} type="radio" name={name} id={`${name}-${option.value}`} value={option.value} defaultChecked={initialValue==option.value} {...rest} />
            <label className="form-check-label" htmlFor={option.htmlFor ? option.htmlFor : option.value} aria-label={option.ariaLabel} >{option.label}</label>
          </div>
        ))}
      </div>
    </div>
  )
}

Radio.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
  value: PropTypes.string,
  initialValue: PropTypes.string,
  status: PropTypes.oneOf(ALERT_STYLES),
  inline: PropTypes.bool,
  styleClasses: PropTypes.string,
}

export default Radio
