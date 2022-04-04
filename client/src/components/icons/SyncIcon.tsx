import React from 'react'
import { Svg } from './Svg'

export const SyncIcon = ({ width, height = 16 }: { width?: number, height?: number }) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    width={width}
    viewBox="0 0 512 512"
  >
    <path fill="currentColor" d="M370.7 133.3A168.2 168.2 0 0 0 93 214.9a12 12 0 0 1-11.6 9.1H24.1a12 12 0 0 1-11.8-14.2 248 248 0 0 1 415-133.1L463 41a24 24 0 0 1 41 17v134a24 24 0 0 1-24 24H346a24 24 0 0 1-17-41l41.7-41.7zM32 296h134a24 24 0 0 1 17 41l-41.7 41.7A168.2 168.2 0 0 0 419 297.1a12 12 0 0 1 11.6-9.1h57.3a12 12 0 0 1 11.8 14.2 248 248 0 0 1-415 133.1L49 471a24 24 0 0 1-41-17V320a24 24 0 0 1 24-24z"/>
  </Svg>
)
