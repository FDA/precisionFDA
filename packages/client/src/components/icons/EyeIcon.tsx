import * as React from 'react'
import { Svg } from './Svg'

export const EyeIcon = ({ className, width, height }: { className?: string; width?: number; height?: number }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)
