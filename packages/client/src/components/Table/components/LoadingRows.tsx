import { Column } from '@tanstack/react-table'
import React from 'react'
import styled, { css } from 'styled-components'

export const Loading1 = styled.div<{ $delay?: number }>`
  @keyframes moving-gradient {
    0% {
      background-position: -250px 0;
    }
    100% {
      background-position: 250px 0;
    }
  }
  display: flex;
  flex: 1 1 auto;
  align-items: center;

  span {
    min-height: 20px;
    width: 400px;
    background: linear-gradient(
      to right,
      var(--c-loading-primary) 20%,
      var(--c-loading-secondary) 50%,
      var(--c-loading-primary) 80%
    );
    background-size: 500px 100px;
    animation-name: moving-gradient;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    ${({ $delay }) =>
      $delay &&
      css`
        animation-delay: 0 ${$delay}s;
      `}
  }
`

export function LoadingRows<T>({
  visibleColumns,
  delay,
}: {
  visibleColumns: Column<T>[]
  delay: number
}) {
  return (
    <tr>
      {visibleColumns.map(column => (
        <td key={column.id} style={{ opacity: 0.5 }} aria-label={`Loading cell for column ${column.id}`}>
          <Loading1 $delay={delay}>
            <span />
          </Loading1>
        </td>
      ))}
    </tr>
  )
}
