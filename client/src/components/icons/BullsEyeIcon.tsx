import React from 'react'
import { Svg } from './Svg'

export const BullsEyeIcon = ({ width, height = 16 }: { width?: number, height?: number }) => (
  <Svg
    aria-hidden="true"
    focusable="false"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 496 512"
    height={height}
    width={width}
  >
    <path
      fill="currentColor"
      d="M248 104c-84.02 0-152 68-152 152 0 84.02 68 152 152 152 84.02 0 152-68 152-152 0-84.02-68-152-152-152zm0 256c-57.35 0-104-46.65-104-104s46.65-104 104-104 104 46.65 104 104-46.65 104-104 104zm0-352C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm0 448c-110.28 0-200-89.72-200-200S137.72 56 248 56s200 89.72 200 200-89.72 200-200 200zm0-256c-30.88 0-56 25.12-56 56s25.12 56 56 56 56-25.12 56-56-25.12-56-56-56z"
    ></path>
  </Svg>
)
