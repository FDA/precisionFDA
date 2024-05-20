import styled, { css } from 'styled-components'
import { ArrowIcon } from '../icons/ArrowIcon'

export const ExpandArrowIcon = styled(ArrowIcon)<{expanded?: boolean, hide?: boolean}>`
  ${({ hide }) => hide && css`
    display: none;
  `}
  ${({ expanded }) => !expanded && css`
    transform: rotate(-90deg);
  `}
`

export const SelectCheckLabel = styled.label`
  padding-left: 12px;
  display: flex;
  align-items: center;
  position: relative;
`

export const StyledExpander = styled.div`
  user-select: none;
`

export const EmptyTable = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50;
  padding: 20px;
`

export const StyledTable = styled.div`
  --_table-bg-color: var(--background);
  --_table-border-color: var(--tertiary-250);
`

type ReactTableStylesProps = {
  $shouldFillWidth?: boolean
  $shouldAllowScrollbar?: boolean
  $stickyHeaders?: boolean
}
export const ReactTableStyles = styled.div<ReactTableStylesProps>`
  .sort {
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
    padding-right: 4px;
  }

  .table {
    .thead {
      background: var(--_table-bg-color);
      display: flex;
      border-top: 1px solid var(--_table-border-color);
      border-bottom: 2px solid var(--_table-border-color);
      user-select: none;

      /* &:hover {
        .resizer {
          opacity: 1;
        }
      } */
    }

    .tbody {
      display: flex;
      flex: 1 1 auto;
      width: 100%;
      flex-direction: column;
      background-color: var(--_table-bg-color);
      ${({ $shouldAllowScrollbar }) => $shouldAllowScrollbar && css`
        max-height: 50vh;
        overflow-y: scroll;
      `}
    }

    .sub {
      background-color: var(--tertiary-100);
    }

    .row-expander {
      justify-content: center;
      display: flex;
    }

    .tr {
      ${({ $shouldFillWidth }) => !$shouldFillWidth && 'width: fit-content;'} 
      border-bottom: 1px solid var(--_table-border-color);
      &:last-child {
        .td {
          border-bottom: 0;
        }
      }
    }

    .th,
    .td {
      display: flex;
      box-sizing: border-box;
      align-items: center;
      margin: 0;
      height: 40px;
      padding: 5px;
      border-right: none;
      overflow: hidden;
      white-space: nowrap;
      /* background-color: white; */
      /* box-shadow: -17px 0px 11px -7px #ffffff; */
      /* The secret sauce */
      /* Each cell should grow equally */
      /* width: 1%; */
      /* But "collapsed" cells should be as small as possible */
      &.collapse {
        width: 0.0000000001%;
      }
      /* :first-child {
        padding-left: 12px;
      } */
      &:last-child {
        border-right: 0;
      }

      &[data-sticky-td] {
        background-color: none;
        box-shadow: none;
        padding: 0;
        display: flex;
        flex: 0 1 auto;
        justify-content: flex-end;
      }
    }

    &.sticky {
      .thead{
        ${({ $shouldFillWidth }) => !$shouldFillWidth && 'width: fit-content;'}
          position: sticky;
          background-color: var(--_table-bg-color);
          top: 0px;
          z-index: 2;
        &.filters {
          top: 43px;
          z-index: 1;
          border-top: none;
        }
      }

      .tbody {
        width: 100%;
      }

      [data-sticky-td] {
        position: sticky;
        background-color: none;
      }

      [data-sticky-last-left-td] {
        /* box-shadow: 2px 0px 3px #ccc; */
      }

      [data-sticky-first-right-td] {
        /* box-shadow: 0px 0px 2px #ccc; */
      }
    }

  }
  .resizer {
    display: inline-block;
    /* opacity: 0.8; */
    transition: ease-in-out opacity 0.2s;
    border-left: 1px solid var(--_table-border-color);
    border-right: 1px solid var(--_table-border-color);
    width: 3px;
    height: 60%;
    position: absolute;
    right: 0;
    transform: translateX(50%);
    z-index: 1;
    cursor: col-resize;
    ${'' /* prevents from scrolling while dragging on touch devices */}
    touch-action:none;
    background: var(--_table-bg-color);

    &.isResizing {
    }
  }
`
