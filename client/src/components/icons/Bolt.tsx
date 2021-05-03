import React from 'react'
import { Svg } from './Svg'

export const BoltIcon = ({
  width,
  height,
}: {
  width?: number
  height?: number
}) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 320 512"
    height={height}
    width={width}
  >
    <path
      fill="currentColor"
      d="M296 160H180.6l42.6-129.8A24 24 0 00200 0H56a24 24 0 00-23.8 20.8l-32 240A24 24 0 0024 288h118.7L96.6 482.5a24 24 0 0044.1 17.5l176-304a24 24 0 00-20.7-36z"
    />
  </Svg>
)
