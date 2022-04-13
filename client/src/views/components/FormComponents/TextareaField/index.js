import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { ALERT_STYLES } from '../../../../constants'
import TextArea from '../TextArea'


const TextareaField = ({ children, text, name, label, status, helpText, aria_label, ...rest }) => (
  <div className={classNames('form-group', 'required', { [`has-${status}`]: status })}>
    <label className="control-label" htmlFor={name}>{label}</label>
    <TextArea id={`${name}-textarea`} name={name} className="form-control" aria_label={aria_label} {...rest}>{text}</TextArea>
    {!!helpText && <span className="help-block">{helpText}</span>}
    {children}
  </div>
)

TextareaField.propTypes = {
  text: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  status: PropTypes.oneOf(ALERT_STYLES),
  helpText: PropTypes.string,
  children: PropTypes.any,
  aria_label: PropTypes.string,
}

export default TextareaField
