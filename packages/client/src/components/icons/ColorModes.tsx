import React from 'react'
import { Svg } from './Svg'

export const LightModeIcon = ({ width = 24, height = 24, style }: { height?: number; width?: number; style?: any }) => (
  <Svg
    fill="none"
    shapeRendering="geometricPrecision"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width={width}
    height={height}
    style={{ color: 'currentcolor' }}
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2" />
    <path d="M12 21v2" />
    <path d="M4.22 4.22l1.42 1.42" />
    <path d="M18.36 18.36l1.42 1.42" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="M4.22 19.78l1.42-1.42" />
    <path d="M18.36 5.64l1.42-1.42" />
  </Svg>
)

export const DarkModeIcon = ({ width = 24, height = 24, style }: { height?: number; width?: number; style?: any }) => (
  <Svg
    fill="none"
    shapeRendering="geometricPrecision"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width={width}
    height={height}
    style={{ color: 'currentcolor' }}
  >
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </Svg>
)
