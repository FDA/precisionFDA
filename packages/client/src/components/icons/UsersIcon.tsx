import React from 'react'
import { Svg } from './Svg'

export const UsersIcon = ({
  width,
  height = 16,
}: {
  width?: number
  height?: number
}) => (
  <Svg
    height={height}
    width={width}
    data-prefix="fas"
    data-icon="users"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 512"
    aria-label="User profile icon"
  >
    <path fill='currentColor' d="M319.9 320c57.4 0 103.1-46.6 103.1-104s-46.5-104-103.1-104a103.3 103.3 0 0 0-103.1 104c-.9 57.4 45.7 104 103.1 104zm50 32h-99.8C191.6 352 128 411.7 128 485.3c0 14.8 12.7 26.7 28.4 26.7h327.2c15.7 0 28.4-11.9 28.4-26.7 0-73.6-63.6-133.3-142.1-133.3zM512 160a80 80 0 1 0 0-160 80 80 0 0 0 0 160zm-328.1 56c0-5.4 1-10.6 1.6-16a73.3 73.3 0 0 0-35.6-8H88.1C39.4 192 0 233.8 0 285.3 0 295.6 7.9 304 17.6 304h199.5a134.7 134.7 0 0 1-33.2-88zM128 160a80 80 0 1 0 0-160 80 80 0 0 0 0 160zm423.9 32h-61.8c-12.8 0-25 3-35.9 8.2.6 5.3 1.6 10.4 1.6 15.8 0 33.7-12.8 64.2-33.2 88h199.7c9.8 0 17.7-8.4 17.7-18.7 0-51.5-39.4-93.3-88.1-93.3z" />
  </Svg>
)