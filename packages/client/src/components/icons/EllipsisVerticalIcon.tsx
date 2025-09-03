import React from 'react'
import { Svg } from './Svg'

export const EllipsisVerticalIcon = ({ width, height = 16 }: { width?: number; height?: number }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" height={height} width={width} viewBox="0 0 128 512">
    <path d="M64 144a56 56 0 1 1 0-112 56 56 0 1 1 0 112zm0 224c30.9 0 56 25.1 56 56s-25.1 56-56 56-56-25.1-56-56 25.1-56 56-56zm56-112c0 30.9-25.1 56-56 56s-56-25.1-56-56 25.1-56 56-56 56 25.1 56 56z" />
  </Svg>
)
