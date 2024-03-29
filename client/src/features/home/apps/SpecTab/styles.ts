import styled from 'styled-components';

export const StyledSpecTab = styled.div`
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
        color: #8198bc;
        text-transform: uppercase;
        font-weight: 300;
        font-size: 14px;
      }
      &_value {
        font-size: 19px;
      }
    }
  }
  .__table-container {
    background-color: #f4f8fd;
    border: 1px solid #ddd;
    border-bottom-right-radius: 3px;
    border-bottom-left-radius: 3px;
    display: flex;
  }
  .__table {
    padding: 10px 15px;
    width: 50%;

    &_title {
      color: #8198bc;
      text-transform: uppercase;
      font-weight: 400;
      font-size: 14px;
      margin-bottom: 10px;
      padding-left: 8px;
    }
    &_row {
      display: flex;
      padding: 8px;
      border-top: 1px solid #ddd;

      &_even {
        background: #ebf3fb;
      }
    }
    &_type {
      width: 120px;
      color: #8198bc;
      font-family: 'PT Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
    }
    &_value {
      display: flex;
      flex-direction: column;

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
      margin-right: 100px;
      margin-left: auto;
    }
    &_required-label {
      text-transform: uppercase;
      font-size: 10px;
      background-color: #a2b3ce;
      color: #ffffff;
      padding: 2px 6px 3px;
      border-radius: 2px;
      font-weight: 700;
    }
  }
`
