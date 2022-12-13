import React from 'react'
import { Svg } from './Svg'

export const AppTypeIconBlue = ({
  width,
  height = 16,
}: {
  width?: number
  height?: number
}) => (
  <Svg
    aria-hidden="true"
    focusable="false"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 400 400"
    height={height}
    width={width}
  >
    <circle cx="200" cy="200" r="200" fill="#F4F8FD" />
    <path
      fill="url(#blue-gradient)"
      d="M179.5 83.5a40 40 0 0 1 40 0l70.4 40.7a40 40 0 0 1 20 34.6v81.4a40 40 0 0 1-20 34.6l-70.4 40.7a40 40 0 0 1-40 0l-70.4-40.7a40 40 0 0 1-20-34.6v-81.4a40 40 0 0 1 20-34.6l70.4-40.7Z"
    />
    <defs>
      <linearGradient
        id="blue-gradient"
        x1="306"
        x2="142.5"
        y1="143.5"
        y2="307"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#37D3D9" />
        <stop offset="1" stopColor="#154CEB" />
      </linearGradient>
    </defs>
  </Svg>
)
