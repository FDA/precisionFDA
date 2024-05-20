/* eslint-disable react/require-default-props */
import React from 'react'
import styled from 'styled-components'
import { Svg } from './icons/Svg'

export const LWrap = styled.div`
  align-self: stretch;
  height: 100%;
`

export const LoaderMargin = styled.div`
  margin: 24px;
`

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  &.inline {
    display: inline;
  }
  &.pageloader {
    padding-top: 16px;
  }
`
type Props = {
  height?: number
  className?: string
}

export const Loader = ({ height = 16, ...rest }: Props) => {
  // Radius of circles; Max 6px, but smaller in small loaders
  const radius = height >= 12 ? 6 : height / 2

  // Width; max 60px
  const width = radius * 10

  // Horizontal position of circles
  const cx1 = 6 * width / 60
  const cx2 = 26 * width / 60
  const cx3 = 46 * width / 60

  return (
    <LoaderWrapper {...rest}>
      <Svg height={height} width={width}>
        <circle fill="var(--base)" stroke="none" cx={cx1} cy={height / 2} r={radius}>
          <animate
            attributeName="opacity"
            dur="1s"
            values="0;1;0"
            repeatCount="indefinite"
            begin="0.1"
          />
        </circle>
        <circle fill="var(--base)" stroke="none" cx={cx2} cy={height / 2} r={radius}>
          <animate
            attributeName="opacity"
            dur="1s"
            values="0;1;0"
            repeatCount="indefinite"
            begin="0.2"
          />
        </circle>
        <circle fill="var(--base)" stroke="none" cx={cx3} cy={height / 2} r={radius}>
          <animate
            attributeName="opacity"
            dur="1s"
            values="0;1;0"
            repeatCount="indefinite"
            begin="0.3"
          />
        </circle>
      </Svg>
    </LoaderWrapper>
  )
}
