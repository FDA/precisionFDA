import React from 'react'
import { Svg } from './Svg'

export const FlapIcon = ({
  width,
  height = 16,
}: {
  width?: number
  height?: number
}) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    width={width}
    viewBox="0 0 10 10"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 0C0.895431 0 0 0.89543 0 2V8C0 9.10457 0.89543 10 2 10H8C9.10457 10 10 9.10457 10 8V2C10 0.895431 9.10457 0 8 0H2ZM2 1C1.44772 1 1 1.44772 1 2V8C1 8.55229 1.44772 9 2 9H5V1H2Z"
      fill="currentColor"
    />
  </Svg>
)
