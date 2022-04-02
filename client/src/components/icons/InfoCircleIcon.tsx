import React from 'react'
import { Svg } from './Svg'

export const InfoCircleIcon = ({ width, height }: { width?: number; height?: number }) => (
  <Svg
    height={height}
    width={width}
    viewBox="0 0 512 512"
  >
    <path
      fill="currentColor"
      d="M256 8C119.04 8 8 119.08 8 256c0 137 111.04 248 248 248s248-111 248-248C504 119.08 392.96 8 256 8zm0 110a42 42 0 110 84 42 42 0 010-84zm56 254a12 12 0 01-12 12h-88a12 12 0 01-12-12v-24a12 12 0 0112-12h12v-64h-12a12 12 0 01-12-12v-24a12 12 0 0112-12h64a12 12 0 0112 12v100h12a12 12 0 0112 12v24z"
    />
  </Svg>
)
