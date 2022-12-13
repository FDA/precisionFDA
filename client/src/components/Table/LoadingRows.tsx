import React from 'react'
import styled, { css } from 'styled-components'
import { ColumnInstance } from 'react-table'


export const Loading1 = styled.div<{delay?: number}>`
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
    background: linear-gradient(to right, #eee 20%, #ddd 50%, #eee 80%);
    background-size: 500px 100px;
    animation-name: moving-gradient;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    ${({delay}) => delay && css`animation-delay: 0.${delay}s`};
  }
`

const sty = css`
  /* background-color: green; */
  height: 80px !important;
  border-top: none !important;
  border-bottom: none !important;
`

const Row = styled.div`
  display: flex;
  width: fit-content;
  border-bottom: 1px solid #d5d5d5;

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
            <div style={{...column.getHeaderProps().style, borderBottom: 0 }} className="tr" key={i} role="loading-row">
              <div className="td" style={{ opacity: 0.5 }}><Loading1 delay={delay}><span></span></Loading1></div>
            </div>
        ))}
      </Row>}
    </>
  )
};
