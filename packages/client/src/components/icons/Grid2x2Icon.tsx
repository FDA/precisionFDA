import React from 'react'
import { Svg } from './Svg'

export const Grid2x2Icon = ({
  width = 24,
  height = 24,
}: {
  color?: string
  width?: number
  height?: number
}) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grid2x2-icon lucide-grid-2x2"><path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/></Svg>
)
