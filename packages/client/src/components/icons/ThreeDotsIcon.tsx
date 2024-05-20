import React from 'react'
import { Svg } from './Svg'

export const ThreeDotsIcon = ({
  color,
  width,
  height = 12,
}: {
  color?: string
  width?: number
  height?: number
}) => (
<Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 12" height={height} width={width}>
  <path fill="currentColor" d="M12 6A6 6 0 1 1 0 6a6 6 0 0 1 12 0Zm18 0a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm12 6a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/>
</Svg>
)
