import React from 'react'
import { Svg } from './Svg'

export const CheckIcon = ({
  width,
  height = 16,
  color='currentColor',
}: {
  width?: number
  height?: number
  color?: string
}) => (
  <Svg
    width={width}
    height={height}
    viewBox='0 0 448 512'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      fill={color}
      d='M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z'
    />
  </Svg>
)
