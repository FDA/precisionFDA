import React from 'react'
import styled, { css } from 'styled-components'
import { fontWeight, theme } from '../../styles/theme'

export interface IButton {
  active?: "warning" | "danger" | "success" | boolean
  disabled?: boolean
  role?: string
  hide?: boolean
}

export const Button = styled.button<IButton>`
  position: relative;
  display: inline-block;
  font-weight: ${fontWeight.bold};
  white-space: nowrap;
  text-align: center;
  verticle-align: middle;
  background-image: none;
  border: 1px solid transparent;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  line-height: 1.428571429;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 3px;
  border-color: rgb(218, 239, 251);
  background: white;
  color: ${theme.colors.primaryBlue};

  &:focus {
    outline: 0;
  }

  ${({ role, disabled }) => { 
    let textColor = theme.colors.primaryBlue;
    let borderColor = 'rgb(218, 239, 251);'
    let borderColorHover = theme.colors.lightBlue;
    let backgroundColorHover = theme.colors.subtleBlue;

    if (role === "warning") {
      // TODO: the colours are not based on mockups and are not final
      textColor = theme.colors.primaryYellow
      borderColor = theme.colors.darkYellow
      borderColorHover = theme.colors.primaryYellow
      backgroundColorHover = theme.lightLightYellow
    }
    else if (role === "danger") {
      // TODO: the colours are not based on mockups and are not final
      textColor = theme.colors.primaryRed
      borderColor = theme.colors.darkRed
      borderColorHover = theme.colors.primaryRed
      backgroundColorHover = 'white'
    }
    else if (role === "success") {
      // TODO: the colours are not based on mockups and are not final
      textColor = theme.colors.primaryGreen
      borderColor = theme.colors.darkGreen
      borderColorHover = theme.colors.primaryGreen
      backgroundColorHover = 'white'
    }
    return css`
      color: ${textColor};
      border-color: ${borderColor};
      
      &:hover {
        ${!disabled && css`
          color: ${textColor};
          background: ${backgroundColorHover};
          border-color: ${borderColorHover};
        `}
      }

      &:active {
        color: ${textColor};
        border-color: ${textColor};
        box-shadow: inset 0 3px 5px rgb(0 0 0 / 13%);
      }
    `
  }}

  ${({ disabled }) => disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
  `}

  ${({ hide }) => hide && css`display: none;`}
 `

export const ButtonSolidBlue = styled(Button)`
  background-color: ${theme.colors.primaryBlue};
  border-color: #1b639f;
  color: ${theme.colors.textWhite};

  &:hover {
    ${({ disabled }) => !disabled && css`
      background-color: rgb(24, 85, 137);
      color: ${theme.colors.textWhite};
    `}
    ${({ disabled }) => disabled && css`
      cursor: not-allowed;
    `}
  }

  &:active {
    color: ${theme.colors.textWhite};
    background-color: rgb(24, 85, 137);
    box-shadow: inset 0 3px 5px rgb(0 0 0 / 13%);
  }
`

export const ButtonSolidGreen = styled(Button)`
  background-color: ${theme.colors.primaryGreen};
  border-color: ${theme.colors.darkGreen};
  color: ${theme.colors.textWhite};

  &:hover {
    ${({ disabled }) => !disabled && css`
      background-color: ${theme.colors.darkGreen};
      color: ${theme.colors.textWhite};
    `}
    ${({ disabled }) => disabled && css`
      cursor: not-allowed;
    `}
  }

  &:active {
    color: ${theme.colors.textWhite};
    background-color: ${theme.colors.darkGreen};
    box-shadow: inset 0 3px 5px rgb(0 0 0 / 13%);
  }
`

export const ButtonSolidRed = styled(Button)`
  background-color: ${theme.colors.primaryRed};
  border-color: ${theme.colors.darkRed};
  color: ${theme.colors.textWhite};

  &:hover {
    ${({ disabled }) => !disabled && css`
      background-color: ${theme.colors.darkRed};
      color: ${theme.colors.textWhite};
    `}
    ${({ disabled }) => disabled && css`
      cursor: not-allowed;
    `}
  }

  &:active {
    color: ${theme.colors.textWhite};
    background-color: ${theme.colors.darkRed};
    box-shadow: inset 0 3px 5px rgb(0 0 0 / 13%);
  }
`
