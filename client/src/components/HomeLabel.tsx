import classnames from 'classnames'
import React from 'react'
import styled from 'styled-components'
import Icon from '../views/components/Icon'

const StyledHomeLabel = styled.span`
  font-size: 14px;
  padding: 2px 5px;
  color: #ffffff;
  border-radius: 4px;

  &--success {
    background: #56d699;
  }

  &--default {
    background: #777777;
  }

  &--warning {
    background: #f0ad4e;
  }

  &__state-running, &__state-idle {

    color: #f0f9fd;
    background-color: #2071b5;
  }

  &__state-done {
    color: #3c763d;
    background-color: #dff0d8;
  }

  &__state-failed, &__state-terminated {
    color: #821a1d;
    background-color: #ffeeed;
  }

  i {
    margin-right: 5px;
  }
`

type StateTypes = 'success' | 'default' | 'warning'

// TODO: Rewrite HomeLabel component to use svg icons instead of FA
export const HomeLabel = ({
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
    <StyledHomeLabel className={classes} {...rest}>
      {icon && <Icon icon={icon} />}
      {value}
    </StyledHomeLabel>
  )
}
