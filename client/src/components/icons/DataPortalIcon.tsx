import React from 'react'
import { Svg } from './Svg'

export const DataPortalIcon = ({
  width,
  height = 16,
}: {
  width?: number
  height?: number
}) => (
  <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 52 52" height={height} width={width}>
    <circle cx="10.5" cy="38.5" r="4.5" fill="currentColor"/>
    <circle cx="38.5" cy="10.5" r="4.5" fill="currentColor"/>
    <path fill="currentColor" fillRule="evenodd" d="M32.5 13h-19a13.5 13.5 0 0 0-9.16 23.42c.34-1 .9-1.88 1.64-2.6A10.5 10.5 0 0 1 13.5 16l21.53.01a6.52 6.52 0 0 1-2.53-3Zm8.79 3.37A10.5 10.5 0 0 1 38.5 37H16.83a6.52 6.52 0 0 1 0 3H38.5a13.5 13.5 0 0 0 5.4-25.88 6.53 6.53 0 0 1-2.61 2.25Z" clipRule="evenodd"/>
    <path fill="currentColor" fillRule="evenodd" d="M37 38.5V16.83a6.52 6.52 0 0 0 3 0V38.5a13.5 13.5 0 0 1-25.88 5.4 6.53 6.53 0 0 0 2.25-2.61A10.5 10.5 0 0 0 37 38.5Zm-21-3.47V13.5a10.5 10.5 0 0 1 17.83-7.52 6.5 6.5 0 0 1 2.59-1.64A13.5 13.5 0 0 0 13 13.5v19a6.52 6.52 0 0 1 3 2.53Z" clipRule="evenodd"/>
    <path fill="currentColor" d="M18 26h4v8h-4zm6-4h4v12h-4zm6-4h4v16h-4z"/>
  </Svg>
)
