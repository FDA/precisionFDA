import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'


const Icon = ({ icon, cssClasses, fw, pointer, ...rest }) => {
  const classes = classNames({
    'fa': true,
    'fa-fw': fw,
    'pfda-cursor-pointer': pointer,
  }, icon, cssClasses)

  return <i className={classes} {...rest} />
}

export default Icon

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  cssClasses: PropTypes.string,
  fw: PropTypes.bool,
  pointer: PropTypes.bool,
}
