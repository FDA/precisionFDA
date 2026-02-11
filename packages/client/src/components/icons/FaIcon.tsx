import React from 'react'
import clsx from 'clsx'


const Icon = ({ icon, cssClasses, fw, pointer, ...rest }: { icon?: string, cssClasses?: string, fw?: boolean, pointer?: boolean, onClick?: () => void }) => {
  const classes = clsx({
    'fa': true,
    'fa-fw': fw,
    'pfda-cursor-pointer': pointer,
  }, icon, cssClasses)

  return <i className={classes} {...rest} />
}

export default Icon
