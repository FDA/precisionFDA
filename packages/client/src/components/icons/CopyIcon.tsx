import * as React from 'react'
import { Svg } from './Svg'

export const CopyIcon = ({
  className,
  width = 12,
  height = 7,
}: {
  className?: string
  width?: number
  height?: number
}) => (
  <Svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    width={width}
    height={height}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z" />
    <path d="M6 12h6v2H6zm0 4h6v2H6z" />
  </Svg>
)
