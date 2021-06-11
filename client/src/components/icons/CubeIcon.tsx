import React from 'react'
import { Svg } from './Svg'

export const CubeIcon = ({
  width,
  height,
}: {
  width?: number
  height?: number
}) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    height={height}
    width={width}
  >
    <path
      fill="currentColor"
      d="M239.1 6.3l-208 78a48 48 0 00-31.1 45v225.1a48 48 0 0026.5 42.9l208 104a47.7 47.7 0 0042.9 0l208-104a48 48 0 0026.5-42.9V129.3a48 48 0 00-31.1-44.9l-208-78a47.2 47.2 0 00-33.7-.1zM256 68.4l192 72v1.1l-192 78-192-78v-1.1l192-72zm32 356V275.5l160-65v133.9l-160 80z"
    />
  </Svg>
)
