import React from 'react'
import { Svg } from './Svg'

export const ReplyArrowIcon = ({
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
    viewBox="0 0 58 49"
    width={width}
    height={height}
  >
    <path
      fill="currentColor"
      d="M.6 16c-.8.7-.8 2 0 2.7l18 15.5c1.2 1 3 .2 3-1.3v-7.2c2.3-.2 6.7-.2 14.8.3 15.5.9 15.5 15 14.7 21.4-.9 6.3 7.1-7.4 6.9-15.7-.5-19-15-21.7-23.1-21.9H21.6v-8c0-1.5-1.8-2.4-3-1.4L.6 16Z"
    />
  </Svg>
)
