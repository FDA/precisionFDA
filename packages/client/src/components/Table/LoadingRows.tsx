import React from 'react'
import styled, { css } from 'styled-components'
import { ColumnInstance } from 'react-table'


export const Loading1 = styled.div<{$delay?: number}>`
  @keyframes moving-gradient {
    0% { background-position: -250px 0; }
    100% { background-position: 250px 0; }
  }
  display: flex;
  flex: 1 1 auto;
  align-items: center;

  span {
    min-height: 20px;
    width: 400px;
    background: linear-gradient(to right, var(--c-loading-primary) 20%, var(--c-loading-secondary) 50%, var(--c-loading-primary) 80%);
    background-size: 500px 100px;
    animation-name: moving-gradient;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    ${({$delay}) => $delay && css`animation-delay: 0.${$delay}s;`}
  }
`

const Row = styled.div`
  display: flex;
  width: fit-content;
  border-bottom: 1px solid var(--tertiary-250);

  .tr {
    padding: 0;
    border-bottom: 0;
    display: flex;
    align-items: center;
  }
`

export function LoadingRows<T extends {}>({ visibleColumns, loading, delay }: { visibleColumns: ColumnInstance<T>[], loading: boolean, delay: number }) {
  return (
    <>
      {loading && <Row>
        {visibleColumns.map((column, i) => (
            <div role="row" style={{...column.getHeaderProps().style, borderBottom: 0 }} className="tr" key={i}>
              <div className="td" style={{ opacity: 0.5 }}><Loading1 $delay={delay}><span></span></Loading1></div>
            </div>
        ))}
      </Row>}
    </>
  )
};
