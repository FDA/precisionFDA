import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { ALERT_STYLES } from '../../../../constants'
import Input, { TYPES } from '../Input'


const TextField = ({ children, type, name, label, row, status, helpText, ...rest }) => {
  const rowClasses = { 'col': row }
  const labelClasses = classNames('control-label', { 'col-form-label': row, ...rowClasses } )
  const inputContainerClass = classNames('control-input-container')
  return (
    <div className={classNames('form-group', 'required', { [`has-${status}`]: status, 'row': row })}>
      {label && <label className={labelClasses} htmlFor={name}>{label}</label>}
      <div className={inputContainerClass}>
        <Input type={type} name={name} {...rest} />
        {!!helpText && <span className="help-block">{helpText}</span>}
      </div>
      {children}
    </div>
  )
}

TextField.propTypes = {
  type: PropTypes.oneOf(TYPES).isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  row: PropTypes.bool,
  status: PropTypes.oneOf(ALERT_STYLES),
  helpText: PropTypes.string,
  children: PropTypes.any,
}

TextField.defaultProps = {
  type: 'text',
}

export default TextField
