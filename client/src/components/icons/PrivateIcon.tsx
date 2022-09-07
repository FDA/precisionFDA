import React from 'react'
import { Svg } from './Svg'

export const PrivateIcon = ({ width, height = 16 }: { width?: number, height?: number }) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    width={width}
    viewBox="0 0 28 28"
  >
 <path d="M23.8293 18C23.4175 16.8348 22.3062 16 21 16H7C5.34315 16 4 17.3431 4 19V19.7146C4 23.4333 8.21053 26 14 26C17.0617 26 19.6819 25.2427 21.4712 24H14V23H22.6339C23.0614 22.5387 23.397 22.0359 23.6286 21.5H14V20.5H23.9308C23.9766 20.2436 24 19.9815 24 19.7146V19H14V18H23.8293Z" fill="#212121"/>
 <path d="M20 8C20 7.746 19.9842 7.4957 19.9536 7.25H14V6.25H19.7408C19.5777 5.71438 19.3417 5.21053 19.0444 4.75H14V3.75H18.2353C17.1501 2.66854 15.6531 2 14 2C10.6863 2 8 4.68629 8 8C8 11.3137 10.6863 14 14 14C15.6531 14 17.1501 13.3315 18.2353 12.25H14V11.25H19.0444C19.3417 10.7895 19.5777 10.2856 19.7408 9.75H14V8.75H19.9536C19.9842 8.5043 20 8.254 20 8Z" fill="#212121"/>
  </Svg>
)
