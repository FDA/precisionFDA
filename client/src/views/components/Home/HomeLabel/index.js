import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './style.sass'
import Icon from '../../Icon'


const types = ['success', 'default', 'warning']

const HomeLabel = ({ className, type = 'default', icon, value, state, ...rest }) => {
  let classes = classnames({
    [`home-label--${type}`]: type,
    [`home-label__state-${state}`]: state,
  }, 'home-label', className)

  return (
    <span className={classes} {...rest} >
      {icon && <Icon icon={icon} />}
      {value}
    </span>
  )
}

HomeLabel.propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOf(types),
  icon: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  state: PropTypes.string,
}

export default HomeLabel
