import React from 'react'
import { Svg } from './Svg'

export const LockIcon = ({
  color,
  width,
  height = 12,
}: {
  color?: string
  width?: number
  height?: number
}) => (
  <Svg
    viewBox="0 0 448 512"
    width={width}
    height={height}
  >
    <path fill={color || 'currentColor'} d="M144 144v48h160v-48a80 80 0 1 0-160 0zm-64 48v-48a144 144 0 0 1 288 0v48h16a64 64 0 0 1 64 64v192a64 64 0 0 1-64 64H64a64 64 0 0 1-64-64V256a64 64 0 0 1 64-64h16z" />
  </Svg>
)
