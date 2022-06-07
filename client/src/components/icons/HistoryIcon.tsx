import React from 'react'
import { Svg } from './Svg'

export const HistoryIcon = ({ width, height = 16 }: { width?: number, height?: number }) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    width={width}
    viewBox="0 0 512 512"
  >
    <path fill="currentColor" d="M504 256a249 249 0 0 1-404 193c-11-9-12-25-1-36l11-11c8-8 22-9 32-2a184 184 0 1 0-12-278l51 51c10 10 3 27-12 27H24c-9 0-16-7-16-16V39c0-15 17-22 27-12l50 50a247 247 0 0 1 419 179zm-181 78 10-12c8-11 6-26-4-34l-41-32V152c0-13-11-24-24-24h-16c-13 0-24 11-24 24v136l65 51c11 8 26 6 34-5z"/>
  </Svg>
)
