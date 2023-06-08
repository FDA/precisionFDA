import React from 'react'
import { Svg } from './Svg'

export const EnvelopeIcon = ({ width, height = 16 }: { width?: number, height?: number }) => (
  <Svg
    aria-hidden="true"
    focusable="false"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    height={height}
    width={width}
  >
    <path fill="currentColor" d="M48 64a48 48 0 0 0-28.8 86.4l217.6 163.2c11.4 8.5 27 8.5 38.4 0l217.6-163.2A48 48 0 0 0 464 64H48zM0 176v208a64 64 0 0 0 64 64h384a64 64 0 0 0 64-64V176L294.4 339.2a63.9 63.9 0 0 1-76.8 0L0 176z"/>
  </Svg>
)
