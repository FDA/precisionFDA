import React from 'react'
import { Svg } from './Svg'

export const LinkedInIcon = ({ width, height = 16 }: { width?: number, height?: number }) => (
  <Svg
    aria-hidden="true"
    focusable="false"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    height={height}
    width={width}
  >
    <path fill="currentColor" d="M100.3 448H7.4V148.9h92.9zM53.8 108.1A54.2 54.2 0 0 1 0 53.8a53.8 53.8 0 0 1 107.6 0 54.2 54.2 0 0 1-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.7V148.9h89v40.8h1.3c12.4-23.5 42.7-48.3 88-48.3 94 0 111.2 61.9 111.2 142.3V448z"/>
  </Svg>
)
