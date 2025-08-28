import React from 'react'
import { Svg } from './Svg'

export const ListIcon = ({
  width = 24,
  height = 24,
}: {
  color?: string
  width?: number
  height?: number
}) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-table-properties-icon lucide-table-properties"><path d="M15 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M21 9H3"/><path d="M21 15H3"/></Svg>
)
