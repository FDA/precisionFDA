import styled from 'styled-components'
import { theme } from '../../styles/theme'


export const DropdownMenu = styled.div`
  text-align: left;
  list-style-type: none;
  background-color: #fff;
  background-clip: padding-box;
  border-radius: 2px;
  outline: none;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
`

export const PopperContainer = styled.div`
  position: relative;
  z-index: 50;
  padding-top: 2px;
  min-height: auto;
`

export const DropdownList = styled.div`
  display: flex;
  flex-direction: column;
`

export const DropdownItem = styled.div`
  padding: 4px;
  min-width: 100px;
  border-bottom: 1px solid ${theme.colors.textDarkGrey};
  cursor: pointer;

  &:hover {
    color: ${theme.colors.textMediumGrey};
  }
`
