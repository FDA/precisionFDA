import styled, { css } from 'styled-components'
import { theme } from '../../styles/theme'
import { ArrowIcon } from '../icons/ArrowIcon'

export const ExpandArrowIcon = styled(ArrowIcon)<{expanded?: boolean, hide?: boolean}>`
  ${({ hide }) => hide && css`
    display: none;
  `}
  ${({ expanded }) => !expanded && css`
    transform: rotate(-90deg);
  `}
`

export const EmptyTable = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50;
  padding: 20px;
`

export const StyledTable = styled.div`
  background-color: white;
`

export const StyledRowActionComponent = styled.div`
  height: 100%;
  background: white;
  display: flex;
  align-items: center;
  padding-right: 5px;
  gap: 0.5rem;
  box-shadow: -17px 0px 11px -7px #ffffff;
`


type ReactTableStylesProps = {
  shouldFillWidth?: boolean
  shouldAllowScrollbar?: boolean
}
export const ReactTableStyles = styled.div<ReactTableStylesProps>`
  .sort {
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
    padding-right: 4px;
  }

  .checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
    border: 1px solid #c4c4c4;
    outline: none;
    position: relative;
    border-radius: 2px;
    margin: 3px 3px 3px 4px;
    padding: initial;

    &:checked:before {
      top: 1px;
      left: 5px;
      width: 7px;
      height: 12px;
      content: '';
      position: absolute;
      transform: rotate(35deg);
      background: transparent;
      border-right: 3px solid #1582b1;
      border-bottom: 3px solid #1582b1;
    }

    &:indeterminate:before {
      top: 7px;
      left: 3px;
      right: 3px;
      bottom: 6px;
      content: "";
      position: absolute;
      background: #1582b1;
    }
  }

  .tableWrap {
    overflow-x: scroll;
    overflow-y: hidden;
  }

  .table {
    .thead {
      display: flex;
      border-top: 1px solid #d5d5d5;
      border-bottom: 2px solid #d5d5d5;
      /* box-shadow: 0rem 0.2rem 1.2rem 0 rgba(0, 0, 0, 0.05); */
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
      background-color: white;
      ${({ shouldAllowScrollbar }) => shouldAllowScrollbar && css`
        max-height: 50vh;
        overflow-y: scroll;
      `}
    }

    .tr {
      ${({ shouldFillWidth }) => !shouldFillWidth && 'width: fit-content;'} 
      border-bottom: 1px solid #d5d5d5;
      :last-child {
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
      :first-child {
        padding-left: 12px;
      }
      :last-child {
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
        ${({ shouldFillWidth }) => !shouldFillWidth && 'width: fit-content;'} 
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
    border-left: 1px solid ${theme.colors.textLightGrey};
    border-right: 1px solid ${theme.colors.textDarkGrey};
    width: 3px;
    height: 60%;
    position: absolute;
    right: 0;
    transform: translateX(50%);
    z-index: 1;
    cursor: col-resize;
    ${'' /* prevents from scrolling while dragging on touch devices */}
    touch-action:none;
    background: white;

    &.isResizing {
    }
  }
`
