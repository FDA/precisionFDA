import React from 'react'
import { Svg } from './Svg'

export const PrismIcon = ({
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
    fill="none"
    viewBox="0 0 67 54"
    width={width}
    height={height}
    style={style}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m30.98 0-2.89 5-11.74 20.34-13.37-7.71L.4 22.12l13.37 7.71L2.89 48.66l-2.89 5h61.96l-2.89-5L33.87 5l-2.9-5Zm-12.9 32.33L8.67 48.66H53.3L30.98 10l-10.3 17.84 6.55 3.78-2.6 4.5-6.54-3.79Zm39.99 5.52h8.7v-3.12h-10.5l1.8 3.12Zm-2.7-4.67h11.4v-3.11h-13.2l1.8 3.1Zm-2.7-4.67h14.1v-3.1H50.89l1.8 3.1Zm-2.69-4.66h16.8v-3.11h-18.6l1.8 3.1Zm-2.69-4.67h19.49v-3.1H45.49l1.8 3.1Z"
      clipRule="evenodd"
    />
  </Svg>
)