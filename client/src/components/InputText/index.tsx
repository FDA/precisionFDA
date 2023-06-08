import React from 'react'
import styled, { css } from 'styled-components'
import { theme } from '../../styles/theme'

export const StyledInput = styled.input`
    font-family: ${theme.fontFamily};
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-variant: tabular-nums;
    list-style: none;
    font-feature-settings: 'tnum';
    position: relative;
    display: inline-block;
    width: 100%;
    min-width: 0;
    padding: 4px 10px;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    line-height: 1.5715;
    background-color: #fff;
    background-image: none;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    transition: all 0.3s;

    &:focus {
      border-color: #40a9ff;
      border-right-width: 1px !important;
      outline: 0;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }

    ${({ disabled }) => disabled && css`
      background-color: #f5f5f5;
    `}
`

export const InputText = React.forwardRef((props: any, ref) => (
  <StyledInput ref={ref} type="text" {...props} />
))

InputText.displayName = 'InputText'
