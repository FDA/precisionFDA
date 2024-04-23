import React from 'react'
import { Svg } from './Svg'

export const CaretIcon = ({ width, height = 16 }: { width?: number, height?: number }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 24 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label='User profile dropdown list icon'

  >
    <path d="M12 12L0.5 0.5H23.5L12 12Z" fill="currentColor" />
  </Svg>
)
