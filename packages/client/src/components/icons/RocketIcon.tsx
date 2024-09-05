import React from 'react'
import { Svg } from './Svg'

export const RocketIcon = ({
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
    viewBox="0 0 62 76"
    width={width}
    height={height}
    style={style}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M57.6 2.6 57 1l-1.8.2c-7.2.7-13 2.5-17.7 5.5a32 32 0 0 0-11 12 53.3 53.3 0 0 0-4 9L11 31c-1.9.6-6 2.8-7 6.4L.2 50.8c-.1 1.4.5 4 4 3.3l13.3-3.3-.8 5.8-.2 1.6 10.6 6.2 1.4-1 4.9-4c1.2 4.4 3 11 4 13.8 1 3.5 3.6 2.6 4.8 1.8 2.1-2.1 7.1-7.1 9.7-9.9 2.6-2.7 2.5-7.3 2-9.2l-3-12.3a51 51 0 0 0 5.5-7.2c2.8-4.7 4.6-9.8 4.9-15.4.3-5.6-1-11.6-3.7-18.4ZM30.7 21C26.1 29.4 24 41 22 55.6l4.8 2.8c11.7-9.1 20.5-16.6 25.4-24.6 2.5-4.1 4-8.4 4.2-13 .2-4.3-.6-9-2.6-14.5A33 33 0 0 0 40 10.8c-3.9 2.5-6.9 5.9-9.3 10.2Z" fill="currentColor"/><path d="M47.8 26a5 5 0 1 1-8.7-5.1 5 5 0 0 1 8.7 5Z" fill="currentColor" />
  </Svg>
)
