import React from 'react'
import { Svg } from './Svg'

export const SearchIcon = ({ width, height, style }: { height?: number, width?: number, style?: any }) => (
  <Svg
    aria-hidden="true"
    width={width}
    height={height}
    viewBox="0 0 512 512"
    style={style}
  >
    <path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7l126.6 126.7a32 32 0 0 1-45.3 45.3L330.7 376A208 208 0 1 1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
  </Svg>
)
