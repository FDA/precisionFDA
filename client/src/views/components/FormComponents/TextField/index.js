import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { ALERT_STYLES } from '../../../../constants'
import Input, { TYPES } from '../Input'


const TextField = ({ children, type, name, label, status, helpText, ...rest }) => (
  <div className={classNames('form-group', { [`has-${status}`]: status })}>
    <label className="control-label" htmlFor={name}>{label}</label>
    <Input type={type} name={name} {...rest} />
    {!!helpText && <span className="help-block">{helpText}</span>}
    {children}
  </div>
)

TextField.propTypes = {
  type: PropTypes.oneOf(TYPES).isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  status: PropTypes.oneOf(ALERT_STYLES),
  helpText: PropTypes.string,
  children: PropTypes.any,
}

TextField.defaultProps = {
  type: 'text',
}

export default TextField
