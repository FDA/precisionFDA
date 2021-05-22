import React from 'react'
import { Svg } from './Svg'

export const FileArchiveIcon = ({
  width,
  height,
}: {
  width?: number
  height?: number
}) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
    height={height}
    width={width}
  >
    <path
      fill="currentColor"
      d="M128.3 160v32h32v-32zm64-96h-32v32h32zm-64 32v32h32V96zm64 32h-32v32h32zm177.6-30.1L286 14A48 48 0 00252.1-.1H48C21.5 0 0 21.5 0 48v416a48 48 0 0048 48h288a48 48 0 0048-48V131.9c0-12.7-5.1-25-14.1-34zM256 51.9l76.1 76.1H256zM336 464H48V48h79.7v16h32V48H208v104a24 24 0 0024 24h104zM194.2 265.7a12 12 0 00-11.8-9.7h-22.1v-32h-32v32l-19.7 97.1a52.4 52.4 0 10102.9.3zm-33.9 124.4c-17.9 0-32.4-12.1-32.4-27s14.5-27 32.4-27 32.4 12.1 32.4 27-14.5 27-32.4 27zm32-198.1h-32v32h32z"
    />
  </Svg>
)
