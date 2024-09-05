import React from 'react'
import { Svg } from './Svg'

export const AppMarketIcon = ({
  width,
  height,
  style,
}: {
  height?: number
  width?: number
  style?: any
}) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 75 73"
    width={width}
    height={height}
    style={style}
  >
    <path d="M5 7.5h22c1.4 0 2.5 1.1 2.5 2.5v21c0 1.4-1.1 2.5-2.5 2.5H5A2.5 2.5 0 0 1 2.5 31V10c0-1.4 1.1-2.5 2.5-2.5Zm0 37h22c1.4 0 2.5 1.1 2.5 2.5v21c0 1.4-1.1 2.5-2.5 2.5H5A2.5 2.5 0 0 1 2.5 68V47c0-1.4 1.1-2.5 2.5-2.5Zm38 0h22c1.4 0 2.5 1.1 2.5 2.5v21c0 1.4-1.1 2.5-2.5 2.5H43a2.5 2.5 0 0 1-2.5-2.5V47c0-1.4 1.1-2.5 2.5-2.5ZM55.7 3.3l15.5 15.6c1 1 1 2.5 0 3.5L56.4 37.2c-1 1-2.6 1-3.5 0L37.3 21.7c-1-1-1-2.6 0-3.5L52.2 3.3c1-1 2.5-1 3.5 0Z" fill="none" stroke="currentColor" strokeWidth="5"/>
  </Svg>
)
