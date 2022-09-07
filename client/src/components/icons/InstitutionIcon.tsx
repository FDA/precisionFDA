import React from 'react'
import { Svg } from './Svg'

export const InstitutionIcon = ({
  width,
  height,
}: {
  width?: number
  height?: number
}) => (
  <Svg
    height={height}
    width={width}
    viewBox="0 0 512 512"
  >
    <path
      fill="currentColor"
      d="M496 128v16a8 8 0 01-8 8h-24v12a12 12 0 01-12 12H60a12 12 0 01-12-12v-12H24a8 8 0 01-8-8v-16a8 8 0 014.94-7.4l232-88a8 8 0 016.12 0l232 88A8 8 0 01496 128zm-24 304H40a24 24 0 00-24 24v16a8 8 0 008 8h464a8 8 0 008-8v-16a24 24 0 00-24-24zM96 192v192H60a12 12 0 00-12 12v20h416v-20a12 12 0 00-12-12h-36V192h-64v192h-64V192h-64v192h-64V192H96z"
    />
  </Svg>
)
