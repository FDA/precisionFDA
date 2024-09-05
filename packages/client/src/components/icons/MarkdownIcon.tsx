import React from 'react'
import { Svg } from './Svg'

export const MarkdownIcon = ({
  width,
  height = 16,
}: {
  width?: number
  height?: number
}) => (
  <Svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    width={width}
    viewBox="0 0 24 24"
  >
    <path fill="currentColor" d="M22.27 19.39H1.73A1.73 1.73 0 0 1 0 17.66V6.34a1.73 1.73 0 0 1 1.73-1.73h20.54A1.73 1.73 0 0 1 24 6.34v11.31a1.73 1.73 0 0 1-1.73 1.73zm-16.5-3.47v-4.5l2.3 2.89 2.31-2.89v4.5h2.31V8.08h-2.3l-2.31 2.88-2.31-2.88h-2.3v7.84zM21.23 12h-2.3V8.08h-2.31V12H14.3l3.46 4.04z" />
  </Svg>
)
