import styled from 'styled-components'

export const StyledSpecTab = styled.div`
  table {
    border-spacing: 0;

    th {
      font-weight: bold;
      text-align: right;
      padding-right: 8px;
      white-space: nowrap;
      min-width: 55px;
    }
    td {
      padding-right: 16px;
    }
    td, th {
      vertical-align: top;
    }
  }

  .__container {
    padding-left: 16px;
    padding-right: 16px;
  }
  .__header {
    display: flex;

    &_item {
      padding: 10px 15px;

      &_label {
        margin-bottom: 5px;
        color: #6d6d6d;
        text-transform: uppercase;
        font-weight: 300;
        font-size: 14px;
      }
      &_value {
        font-size: 14px;
      }
    }
  }
  .__table-container {
    margin-top: 16px;
    border-top: 1px solid var(--c-layout-border);
    border-bottom: 1px solid var(--c-layout-border);
    border-bottom-right-radius: 3px;
    border-bottom-left-radius: 3px;
    display: flex;
    flex-wrap: wrap;
  }
  .__table-block {
    display: flex;
    flex-wrap: wrap;
    margin-top: 32px;
  }
  .__table {
    flex: 0 1 auto;
    padding: 10px 15px;
    max-width: 550px;
    min-width: 350px;

    &_title {
      text-transform: uppercase;
      font-weight: 400;
      font-size: 14px;
      margin-bottom: 10px;
      padding-left: 8px;
    }
    &_row {
      font-size: 14px;
      display: flex;
      padding: 8px;
      border-top: 1px solid var(--c-layout-border-200);
    }
    &_type {
      min-width: 100px;
      font-size: 14px;
      font-family: 'PT Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
    }
    &_value {
      display: flex;
      flex-direction: column;
      margin-left: 16px;

      span {
        margin-bottom: 5px;
      }
      &-label {
        font-weight: 700;
      }
      &-default {
        color: #777777;
        font-size: 11px;
      }
    }
    &_required {
      margin-left: auto;
    }
    &_required-label {
      text-transform: uppercase;
      font-size: 10px;
      background-color: var(--primary-300);
      color: white;
      padding: 2px 6px 3px;
      border-radius: 2px;
      font-weight: 700;
    }
  }
`
