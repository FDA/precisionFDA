import React from 'react'
import styled from 'styled-components'
import { ErrorIcon } from '../icons/ErrorIcon'

const StyledInlineError = styled.div`
  display: flex;
  align-items: center;
  color: var(--warning-500);
  svg {
    margin-right: 4px;
  }
`

export const InlineError = ({ msg = 'Error loading' }) => {
  return (
    <StyledInlineError><ErrorIcon height={14} />{msg}</StyledInlineError>
  )
}
