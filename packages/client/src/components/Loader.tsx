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

export const Loader = ({ height = 16, ...rest }: Props) => (
  <LoaderWrapper {...rest}>
    <Svg height={height} width={60}>
      <circle fill="var(--base)" stroke="none" cx="6" cy={height / 2} r="6">
        <animate
          attributeName="opacity"
          dur="1s"
          values="0;1;0"
          repeatCount="indefinite"
          begin="0.1"
        />
      </circle>
      <circle fill="var(--base)" stroke="none" cx="26" cy={height / 2} r="6">
        <animate
          attributeName="opacity"
          dur="1s"
          values="0;1;0"
          repeatCount="indefinite"
          begin="0.2"
        />
      </circle>
      <circle fill="var(--base)" stroke="none" cx="46" cy={height / 2} r="6">
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
