import React from 'react'
import { Svg } from './Svg'

export const CircleCheckIcon = ({
  width,
  height = 16,
  ...rest
}: {
  width?: number
  height?: number
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M504 256a248 248 0 1 1-496 0 248 248 0 0 1 496 0zM227.3 387.3l184-184a16 16 0 0 0 0-22.6L388.7 158a16 16 0 0 0-22.6 0L216 308l-70-70a16 16 0 0 0-22.7 0l-22.6 22.6a16 16 0 0 0 0 22.6l104 104a16 16 0 0 0 22.6 0z"
    />
  </Svg>
)
