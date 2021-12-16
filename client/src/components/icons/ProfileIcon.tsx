import React from 'react'
import { Svg } from './Svg'

export const ProfileIcon = ({ width, height = 16 }: { width?: number, height?: number }) => (
  <Svg
    height={height}
    width={width}
    data-prefix="fas"
    data-icon="user-circle"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 496 512"
    aria-label='User profile icon'
    
  >
    <path fill="currentColor" d="M248 8a248 248 0 100 496 248 248 0 000-496zm0 96a88 88 0 110 176 88 88 0 010-176zm0 344a191.6 191.6 0 01-146.5-68.2A111.5 111.5 0 01200 320c2.4 0 4.8.4 7.1 1.1 13 4.2 26.6 6.9 40.9 6.9 14.3 0 28-2.7 40.9-6.9 2.3-.7 4.7-1.1 7.1-1.1 42.9 0 79.7 24.4 98.5 59.8A191.6 191.6 0 01248 448z"/>
  </Svg>
)
