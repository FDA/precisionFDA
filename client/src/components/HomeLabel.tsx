import classnames from 'classnames'
import React from 'react'
import styled from 'styled-components'
import { colors } from '../styles/theme'
import Icon from './icons/FaIcon'

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

    color: ${colors.stateRunningBackground};
    background-color: ${colors.stateRunningColor};
  }

  &__state-done {
    color: ${colors.stateDoneColor};
    background-color: ${colors.stateDoneBackground};
  }

  &__state-failed, &__state-terminated {
    color: ${colors.stateFailedColor};
    background-color: ${colors.stateFailedBackground};
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
