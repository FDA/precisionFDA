import React from 'react'
import { Svg } from './icons/Svg'

export const Loader = ({ height = 16 } : { height?: number }) => (
  <Svg
    height={height}
    width={60}
  >
<circle fill="#343E4D" stroke="none" cx="6" cy={height/2} r="6">
    <animate
      attributeName="opacity"
      dur="1s"
      values="0;1;0"
      repeatCount="indefinite"
      begin="0.1"/>    
  </circle>
  <circle fill="#343E4D" stroke="none" cx="26" cy={height/2} r="6">
    <animate
      attributeName="opacity"
      dur="1s"
      values="0;1;0"
      repeatCount="indefinite" 
      begin="0.2"/>       
  </circle>
  <circle fill="#343E4D" stroke="none" cx="46" cy={height/2} r="6">
    <animate
      attributeName="opacity"
      dur="1s"
      values="0;1;0"
      repeatCount="indefinite" 
      begin="0.3"/>     
  </circle>
  </Svg>
)
