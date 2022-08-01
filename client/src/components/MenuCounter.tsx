import React from 'react'
import styled, { css } from 'styled-components'
import { colors } from '../styles/theme'

export const StyledMenuCounter = styled.span<{
  isLong?: boolean
  active?: boolean
}>`
  height: 20px;
  min-width: 20px;
  line-height: 0;
  ${({ isLong }) => isLong && 'padding: 0 2px;'}
  display: flex;
  justify-content: center;
  align-items: center;

  justify-self: flex-end;
  margin-right: 24px;
  color: ${colors.textDarkGrey};
  font-size: 12px;

  ${({ active }) => active && css`
    color: ${colors.textWhite};
  `}
`

export const MenuCounter = ({
  count,
  active,
}: {
  count?: string
  active?: boolean
}) => {
  const displayedCount = count ?? '0'
  return (
    <StyledMenuCounter isLong={displayedCount.length > 2} active={active}>
      {displayedCount}
    </StyledMenuCounter>
  )
}
