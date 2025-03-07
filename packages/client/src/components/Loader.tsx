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

type LoaderProps = {
  height?: number
  className?: string
}

export const Loader = ({ height = 16, className }: LoaderProps) => {
  // Calculate dimensions
  const radius = Math.min(6, height / 2)
  const width = radius * 10

  // Define circle positions
  const circles = [
    { cx: width * 0.1, delay: '0.1' },
    { cx: width * 0.433, delay: '0.2' },
    { cx: width * 0.766, delay: '0.3' },
  ]

  return (
    <LoaderWrapper className={className}>
      <Svg height={height} width={width}>
        {circles.map(({ cx, delay }) => (
          <circle key={delay} fill="var(--base)" stroke="none" cx={cx} cy={height / 2} r={radius}>
            <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin={delay} />
          </circle>
        ))}
      </Svg>
    </LoaderWrapper>
  )
}
