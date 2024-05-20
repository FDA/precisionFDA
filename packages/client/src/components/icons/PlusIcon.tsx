import React from 'react'
import { Svg } from './Svg'

export const PlusIcon = ({ width, height, style }: { height?: number, width?: number, style?: any }) => (
  <Svg
    aria-hidden="true"
    width={width}
    height={height}
    viewBox="0 0 448 512"
    style={style}
  >
    <path
      fill="currentColor"
      d="M416 208H272V64c0-18-14-32-32-32h-32c-18 0-32 14-32 32v144H32c-18 0-32 14-32 32v32c0 18 14 32 32 32h144v144c0 18 14 32 32 32h32c18 0 32-14 32-32V304h144c18 0 32-14 32-32v-32c0-18-14-32-32-32z"
    />
  </Svg>
)

export const CrossIcon = (props: any) => <PlusIcon style={{ transform: 'rotate(45deg)' }} {...props} />
