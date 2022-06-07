import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'


export const TYPES = ['text', 'password', 'hidden']

const Input = ({ type, name, lg, id, placeholder, styleClasses, value, defaultValue, autoComplete, ...rest }) => {
  const classes = classNames({
    'form-control': true,
    'input-lg': lg,
  }, styleClasses)
  return (
    <input
      type={type}
      id={id || name}
      name={name}
      placeholder={placeholder}
      className={classes}
      value={value}
      defaultValue={defaultValue}
      maxLength="256"
      autoComplete={autoComplete}
      {...rest}
    />
  )
}

Input.propTypes = {
  type: PropTypes.oneOf(TYPES),
  name: PropTypes.string.isRequired,
  id: PropTypes.string,
  styleClasses: PropTypes.string,
  placeholder: PropTypes.string,
  lg: PropTypes.bool,
  autoComplete: PropTypes.string,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
}

Input.defaultProps = {
  type: 'text',
  lg: false,
  autoComplete: 'off',
}

export default Input
