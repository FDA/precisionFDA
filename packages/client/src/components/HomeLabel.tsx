import clsx from 'clsx'
import React from 'react'
import styled from 'styled-components'
import { colors } from '../styles/theme'
import Icon from './icons/FaIcon'

const StyledHomeLabel = styled.span`
  font-size: 14px;
  padding: 2px 5px;
  color: #ffffff;
  border-radius: 4px;

  &.home-label--success {
    background: #56d699;
  }

  &.home-label--default {
    background: #777777;
  }

  &.home-label--warning {
    background: #f0ad4e;
  }

  &.home-label__state-running,
  &.home-label__state-idle {

    color: ${colors.stateRunningBackground};
    background-color: ${colors.stateRunningColor};
  }

  &.home-label__state-done {
    color: ${colors.stateDoneColor};
    background-color: ${colors.stateDoneBackground};
  }

  &.home-label__state-failed,
  &.home-label__state-terminated {
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
  const classes = clsx(
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
