import React from 'react'
import { Svg } from './Svg'

export const KeyIcon = ({
  width,
  height = 16,
}: {
  width?: number
  height?: number
}) => (
  <Svg
    aria-hidden="true"
    height={height}
    width={width}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M336 352a176 176 0 1 0-167.7-122.3L7 391a24 24 0 0 0-7 17v80a24 24 0 0 0 24 24h80a24 24 0 0 0 24-24v-40h40a24 24 0 0 0 24-24v-40h40a24 24 0 0 0 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zm40-176a40 40 0 1 1 0-80 40 40 0 0 1 0 80z" />
  </Svg>
)
