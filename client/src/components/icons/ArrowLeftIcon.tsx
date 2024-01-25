import React from 'react'
import styled from 'styled-components'
import { Svg } from './Svg'

const StyledArrow = styled(Svg)`
  &.right {
    transform: scaleX(-1);
  }
`

export const ArrowLeftIcon = ({
  right = false,
  width,
  height = 14,
}: {
  right?: boolean
  width?: number
  height?: number
}) => (
  <StyledArrow
    aria-hidden="true"
    data-icon="arrow-left"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    height={height}
    width={width}
    className={right ? 'right' : undefined}
  >
    <path
      fill="currentColor"
      d="M257.5 445.1l-22.2 22.2a23.9 23.9 0 01-33.9 0L7 273a23.9 23.9 0 010-33.9L201.4 44.7a23.9 23.9 0 0133.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"
    />
  </StyledArrow>
)
