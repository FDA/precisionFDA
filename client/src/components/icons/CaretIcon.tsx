import React from 'react'
import { Svg } from './Svg'

export const CaretIcon = ({ width = 8 }: { width?: number }) => (
  <Svg
    width={width}
    viewBox="0 0 24 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 12L0.5 0.5H23.5L12 12Z" fill="currentColor" />
  </Svg>
)
