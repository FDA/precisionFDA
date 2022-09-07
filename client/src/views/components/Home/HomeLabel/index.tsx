import classnames from 'classnames'
import React from 'react'
import Icon from '../../Icon'
import './style.sass'

type StateTypes = 'success' | 'default' | 'warning'

// TODO: Rewrite HomeLabel component to use svg icons instead of FA
const HomeLabel = ({
  className,
  type = 'default',
  icon,
  value,
  state,
  ...rest
}: {
  className?: string
  type?: StateTypes
  icon: string
  value: React.ReactNode
  state?: string
}) => {
  let classes = classnames(
    {
      [`home-label--${type}`]: type,
      [`home-label__state-${state}`]: state,
    },
    'home-label',
    className,
  )

  return (
    <span className={classes} {...rest}>
      {icon && <Icon icon={icon} />}
      {value}
    </span>
  )
}

export default HomeLabel
