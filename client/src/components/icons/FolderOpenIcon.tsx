import React from 'react'
import { Svg } from './Svg'

export const FolderOpenIcon = ({
  width,
  height,
}: {
  width?: number
  height?: number
}) => (
  <Svg height={height} width={width} viewBox="0 0 576 512">
    <path
      fill="currentColor"
      d="m572.7 292-72.4 124.2A64 64 0 0 1 445 448H45a24 24 0 0 1-20.7-36l72.4-124.2A64 64 0 0 1 152 256h400a24 24 0 0 1 20.7 36zM152 224h328v-48a48 48 0 0 0-48-48H272l-64-64H48a48 48 0 0 0-48 48v278l69-118.4a96.3 96.3 0 0 1 83-47.6z"
    />
  </Svg>
)
