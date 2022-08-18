import React from 'react'
import { Svg } from './Svg'

export const UnlockIcon = ({
  width,
  height = 14,
}: {
  width?: number
  height?: number
}) => (
  <Svg
    aria-hidden="true"
    data-icon="angle-down"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 512"
    width={width}
    height={height}
  >
    <path
      fill="currentColor"
      d="M352 192h32c35 0 64 29 64 64v192c0 35-29 64-64 64H64c-35 0-64-29-64-64V256c0-35 29-64 64-64h224v-48a144 144 0 0 1 288 0v48a32 32 0 1 1-64 0v-48a80 80 0 1 0-160 0v48z"
    />
  </Svg>
)

