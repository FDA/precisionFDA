import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import { ALERT_STYLES } from '../../../../constants'
import Select from '../Select'


const SelectField = ({ children, name, label, status, options, value, selectLabel, helpText, multiple, ...rest }) => {
  selectLabel && options.unshift({ label: selectLabel, value: null })

  return (
    <div className={classNames('form-group', { [`has-${status}`]: status })}>
      <label className="control-label" htmlFor={name}>{label}</label>
      <Select options={options} name={name} value={value} multiple={multiple} {...rest} />
      {!!helpText && <span className="help-block">{helpText}</span>}
      {children}
    </div>
  )
}

const valuePropType = PropTypes.oneOfType([PropTypes.string, PropTypes.number])

SelectField.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: valuePropType,
    }),
  ),
  value: PropTypes.oneOfType([
    valuePropType,
    PropTypes.arrayOf(valuePropType),
  ]),
  selectLabel: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  status: PropTypes.oneOf(ALERT_STYLES),
  helpText: PropTypes.string,
  multiple: PropTypes.bool,
  children: PropTypes.node,
}

export default SelectField
