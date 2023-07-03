import React from 'react'
import { Svg } from './Svg'

export const DataPortalIcon = ({
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
    viewBox="0 0 45 45"
    height={height}
    width={width}
  >
    <rect
      width="42"
      height="42"
      x="1.5"
      y="1.5"
      stroke="currentColor"
      strokeWidth="3"
      rx="2.5"
      fill="none"
    />
    <path stroke="currentColor" strokeWidth="3" d="M0 13.5h45" />
    <circle cx="7.5" cy="7.5" r="2.5" fill="currentColor" />
    <circle cx="13.5" cy="7.5" r="2.5" fill="currentColor" />
    <circle cx="19.5" cy="7.5" r="2.5" fill="currentColor" />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m22.2 21.1-4.8 2.2 4.8 2.1 4.6-2.1-4.6-2.2Zm9.4 1.3a2 2 0 0 0-.6-.4l-8-3.8a2 2 0 0 0-1.6 0L13.2 22a2 2 0 0 0-1.2 2.2l.2 10.3a2 2 0 0 0 1.2 1.8l8 3.7a2 2 0 0 0 1.7 0l8-3.7a2 2 0 0 0 1.1-1.8V24a2 2 0 0 0-.6-1.5Zm-7.4 13.8v-7.4l5-2.4V34l-5 2.3Zm-4-7.3v7.3l-5-2.3-.1-7.4 5.1 2.4Z"
      clipRule="evenodd"
    />
  </Svg>
)
