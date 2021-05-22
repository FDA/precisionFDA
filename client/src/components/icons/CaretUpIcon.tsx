import React from 'react'
import { Svg } from './Svg'

export const CaretUpIcon = ({ width = 16 }: { width?: number }) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    viewBox="0 0 320 512"
  >
    <path
      fill="currentColor"
      d="M288.7 352H31.3a20 20 0 01-14.1-34.1l128.7-128.7a20 20 0 0128.2 0l128.7 128.7a20 20 0 01-14.1 34.1z"
    />
  </Svg>
)
