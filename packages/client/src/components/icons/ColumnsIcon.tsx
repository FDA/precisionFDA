import React from 'react'
import { Svg } from './Svg'

export const ColumnsIcon = ({
  width,
  height = 16,
}: {
  width?: number
  height?: number
}) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    width={width}
    viewBox="0 0 69 50"
  >
    <path fill="currentColor" d="M0 7a7 7 0 0 1 7-7h12v50H7a7 7 0 0 1-7-7V7Zm25 43V0h19v50H25Zm25 0h12a7 7 0 0 0 7-7V7a7 7 0 0 0-7-7H50v50Z"/>
  </Svg>
)