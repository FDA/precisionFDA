import React from 'react'
import { Svg } from './Svg'

export const ErrorIcon = ({ width, height = 16 }: { width?: number, height?: number }) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    width={width}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2.2 18.5 8-14.5c.7-1.3 2.9-1.3 3.6 0l8 14.5c.6 1.1-.3 2.5-1.8 2.5H4c-1.5 0-2.4-1.4-1.8-2.5ZM12 9v4M12 17v0"/>
  </Svg>
)
