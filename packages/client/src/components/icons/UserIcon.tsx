import React from 'react'
import { Svg } from './Svg'

export const UsersIcon = ({
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
      d="M96 224a64 64 0 1 0-.1-128.1A64 64 0 0 0 96 224zm448 0a64 64 0 1 0-.1-128.1A64 64 0 0 0 544 224zm32 32h-64a63.8 63.8 0 0 0-45.1 18.6c40.3 22.1 68.9 62 75.1 109.4h66a32 32 0 0 0 32-32v-32a64 64 0 0 0-64-64zm-256 0a112 112 0 1 0 .1-223.9A112 112 0 0 0 320 256zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3A115.2 115.2 0 0 0 128 403.2V432a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4A63.8 63.8 0 0 0 128 256H64a64 64 0 0 0-64 64v32a32 32 0 0 0 32 32h65.9a146.6 146.6 0 0 1 75.2-109.4z"
    />
  </Svg>
)

