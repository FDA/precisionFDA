import React from 'react'
import classNames from 'classnames/bind'


const Icon = ({ icon, cssClasses, fw, pointer, ...rest }: { icon?: string, cssClasses?: string, fw?: boolean, pointer?: boolean}) => {
  const classes = classNames({
    'fa': true,
    'fa-fw': fw,
    'pfda-cursor-pointer': pointer,
  }, icon, cssClasses)

  return <i className={classes} {...rest} />
}

export default Icon
