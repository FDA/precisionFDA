import React from 'react'
import styled from 'styled-components'

export const StyledMenuCounter = styled.span<{
  $isLong?: boolean
  $active?: boolean
}>`
  height: 20px;
  min-width: 20px;
  line-height: 0;
  ${({ $isLong }) => $isLong && 'padding: 0 2px;'}
  display: flex;
  justify-content: center;
  align-items: center;
  justify-self: flex-end;
  margin-right: 24px;
  font-size: 12px;
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
    <StyledMenuCounter $isLong={displayedCount.length > 2} $active={active}>
      {displayedCount}
    </StyledMenuCounter>
  )
}
