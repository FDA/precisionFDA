import React from 'react'
import { Svg } from './Svg'

export const NewspaperIcon = ({ width, height = 16 }: { width?: number, height?: number }) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    width={width}
    viewBox="0 0 512 512"
  >
    <path fill="currentColor" d="M168 80a24 24 0 0 0-24 24v304c0 8.4-1.4 16.5-4.1 24H440a24 24 0 0 0 24-24V104a24 24 0 0 0-24-24H168zM72 480a72 72 0 0 1-72-72V112a24 24 0 1 1 48 0v296a24 24 0 1 0 48 0V104a72 72 0 0 1 72-72h272a72 72 0 0 1 72 72v304a72 72 0 0 1-72 72H72zm104-344a24 24 0 0 1 24-24h96a24 24 0 0 1 24 24v80a24 24 0 0 1-24 24h-96a24 24 0 0 1-24-24v-80zm200-24h32a24 24 0 1 1 0 48h-32a24 24 0 1 1 0-48zm0 80h32a24 24 0 1 1 0 48h-32a24 24 0 1 1 0-48zm-176 80h208a24 24 0 1 1 0 48H200a24 24 0 1 1 0-48zm0 80h208a24 24 0 1 1 0 48H200a24 24 0 1 1 0-48z"/>
  </Svg>
)
