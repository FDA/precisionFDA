/* eslint-disable react/require-default-props */
import React from 'react'
import styled, { css } from 'styled-components'
import { colors } from '../styles/theme'
import { Svg } from './icons/Svg'

const LoaderWrapper = styled.div<{displayInline?: boolean}>`
  display: flex;
  justify-content: center;
  padding-top: 16px;
  ${({ displayInline }) => displayInline && css`
    display: inline;
  `}
`
type Props = {
  height?: number
  displayInline?: boolean
}

export const Loader = ({ height = 16, displayInline }: Props) => (
  <LoaderWrapper displayInline={displayInline}>
    <Svg height={height} width={60}>
      <circle fill={colors.darkBlue} stroke="none" cx="6" cy={height / 2} r="6">
        <animate
          attributeName="opacity"
          dur="1s"
          values="0;1;0"
          repeatCount="indefinite"
          begin="0.1"
        />
      </circle>
      <circle fill={colors.darkBlue} stroke="none" cx="26" cy={height / 2} r="6">
        <animate
          attributeName="opacity"
          dur="1s"
          values="0;1;0"
          repeatCount="indefinite"
          begin="0.2"
        />
      </circle>
      <circle fill={colors.darkBlue} stroke="none" cx="46" cy={height / 2} r="6">
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
