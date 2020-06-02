import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import './style.sass'


const TYPES = ['danger', 'success', 'warning', 'primary', 'info', 'default']
const SIZES = ['sm', 'xs', 'lg']

const Button = ({ children, type, size, ...rest }) => {
  const typeClass = TYPES.includes(type) ? `btn-${type}` : 'btn-default'
  const sizeClass = SIZES.includes(size) ? `btn-${size}` : null

  const classes = classNames(['btn', typeClass, sizeClass])
  return <button {...rest} className={classes}>{children}</button>
}

export default Button

Button.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  type: PropTypes.oneOf(TYPES),
  size: PropTypes.oneOf(SIZES),
}
