import React from 'react'
import { Svg } from './Svg'

export const SpaceReportIcon = ({
  width,
  height = 16,
}: {
  width?: number
  height?: number
}) => (
  <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" height={height} width={width}>
    <path
      fill="currentColor"
      d="M32 32c17.7 0 32 14.3 32 32V400c0 8.8 7.2 16 16 16H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H80c-44.2 0-80-35.8-80-80V64C0 46.3 14.3 32 32 32zm96 96c0-17.7 14.3-32 32-32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32H160c-17.7 0-32-14.3-32-32zm96 64H352c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32zm160 96h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H384c-17.7 0-32-14.3-32-32s14.3-32 32-32z"
    />
  </Svg>
)
