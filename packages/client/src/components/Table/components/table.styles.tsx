import styled, { css } from 'styled-components'
import { ArrowIcon } from '../../icons/ArrowIcon'
import { compactScrollBarV2 } from '../../Page/page.styles'

export const StyledPageTable = styled.div`
  font-size: 14px;
  flex: 1;
  min-height: 0;
  ${compactScrollBarV2}
  overflow: auto;
`

export const TableStyles = styled.div`
  --_table-bg-color: var(--background);
  --_table-border-color: var(--tertiary-250);
  --_table-cell-height: 40px;
  position: relative;

  * {
    box-sizing: border-box;
  }

  table {
    table-layout: fixed;
    border: none;
    width: fit-content;
    /* Tailwind preflight sets border-collapse: collapse. Collapsed borders are painted by the
       table rather than by the sticky <thead>, which leaves 1px transparent slits along the
       header rows that scrolled body rows show through. */
    border-collapse: separate;
    border-spacing: 0;
  }

  thead {
    background-color: var(--background);
    z-index: 2;
    border: none;
    position: sticky;
    top: 0px;
  }

  th,
  td {
    padding: 4px;
    text-align: left;
    white-space: nowrap;
  }

  th {
    padding: 2px 4px;
    position: relative;
    font-weight: bold;
  }

  td {
    height: var(--_table-cell-height);
  }

  thead tr,
  tbody tr {
    &:focus {
      outline: none;
    }
    td,
    th {
      overflow: clip;
      background-color: var(--background);
      box-shadow: inset 0px -1px 0 0 var(--_table-border-color);
      &:first-of-type {
        padding-left: 16px;
      }
      padding-left: 8px;
    }
    &.sub-row {
      td:first-child {
        margin-left: 16px;
      }
      td {
        background-color: var(--background-shaded);
      }
    }
  }

  tbody tr.row-click-select {
    cursor: pointer;
  }

  tbody tr.row-click-select:hover td {
    background-color: var(--background-shaded);
  }

  .col-select-btn {
    background: none;
    border: none;
  }
  .col-sort-btn {
    cursor: pointer;
    user-select: none;
  }
  .col-visible {
    position: sticky;
    overflow: initial;
    box-shadow: none;

    right: 18px;
    height: 40px;
    width: 0;
    align-items: center;
    justify-content: flex-end;
    z-index: 10;
    display: grid;
    padding: 0;
  }

  .name-row {
    height: var(--_table-cell-height);

    th {
      border-top: 1px solid var(--c-layout-border-200);
    }
  }

  .name-btn {
    font-weight: 500;
  }

  .filter-row {
    th {
      overflow: visible;
    }
    input {
      font-size: 14px;
      font-weight: 400;
      background-color: var(--tertiary-30);
      border: 1px solid var(--c-input-border);
      padding: 2px 4px;
      min-height: 28px;

      border-radius: var(--radius-md);
      border-width: 1px;
      width: 9rem;
      width: 100%;

      transition:
        border-color 150ms ease,
        background-color 150ms ease;

      &:hover {
        border-color: var(--primary-400);
      }

      &:focus-visible {
        outline: 1px solid var(--primary-200);
      }
    }
  }

  *:focus-visible,
  *:focus {
    outline-color: var(--primary-200);
    outline-style: auto;
  }

  .filter-input-wrap {
    padding: 4px 0;
  }

  .cell-select {
    padding-left: 16px;
    button:focus-visible,
    button label:focus-visible,
    button:focus {
      outline: none;
    }

    label {
      position: relative;
      display: flex;
      align-items: center;
    }

    &.cell-select-header button {
      position: absolute;
      top: 10px;
    }
  }

  .sticky-left {
    position: sticky;
    left: 0;
    z-index: 1;
    background-color: var(--background);
  }

  .table-empty {
    position: absolute;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    width: 100%;
    white-space: normal;
  }

  .resizer {
    position: absolute;
    top: 0;
    height: 70%;
    width: 5px;
    border-right: 2px solid var(--base);
    margin: 0 0;
    cursor: col-resize;
    user-select: none;
    touch-action: none;
  }

  .resizer.ltr {
    top: 6px;
    right: 0;
  }

  .resizer.rtl {
    top: 6px;
    left: 0;
  }

  .resizer.isResizing {
    border-right: 2px solid var(--base);
    opacity: 0.2;
  }

  @media (hover: hover) {
    .resizer {
      opacity: 0.1;
    }

    *:hover > .resizer {
      opacity: 0.2;
    }
  }
`

export const ExpandArrowIcon = styled(ArrowIcon)<{ expanded?: boolean; hide?: boolean }>`
  ${({ hide }) =>
    hide &&
    css`
    display: none;
  `}
  ${({ expanded }) =>
    !expanded &&
    css`
    transform: rotate(-90deg);
  `}
`
