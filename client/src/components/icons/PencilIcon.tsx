import React from 'react'
import { Svg } from './Svg'

export const PencilIcon = ({
  color = 'currentColor',
  width,
  height = 12,
}: {
  color?: string
  width?: number
  height?: number
}) => (
<Svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 46 47" height={height} width={width}>
  <path fill={color} d="M0 46.5 2 34l10 10-12 2.5ZM30.5 5 3 32.5 13.5 43 41 15.5 33 8 7 34l-1.5-1.5L32 6.5 30.5 5ZM42 14 32 4l3-3c1.6-1.6 3.67-.67 4.5 0L45 6.5c1.2 1.2.83 3.17.5 4L42 14Z"/>
</Svg>
)
