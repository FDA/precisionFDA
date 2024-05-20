import React from 'react'
import { Svg } from './Svg'

export const DatabaseIcon = ({ width, height = 16 }: { width?: number, height?: number }) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    width={width}
    viewBox="0 0 448 512"
  >  
    <path fill="currentColor" d="M448 73.1V119C448 159 347.7 192 224 192S0 159.1 0 118.9V73C0 33 100.3 0 224 0s224 32.9 224 73.1zm0 102.9v102.9C448 319 347.7 352 224 352S0 319.1 0 278.9V176c48.1 33.1 136.2 48.6 224 48.6S399.9 209 448 176zm0 160v102.9C448 479 347.7 512 224 512S0 479.1 0 438.9V336c48.1 33.1 136.2 48.6 224 48.6S399.9 369 448 336z"/>
  </Svg>
)
