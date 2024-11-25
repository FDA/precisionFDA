import styled from 'styled-components'

export const DropdownMenu = styled.div`
  border: 1px solid var(--c-dropdown-menu-border, transparent);
  text-align: left;
  list-style-type: none;
  background-color: var(--c-dropdown-bg);
  border-radius: 4px;
  outline: none;
  overflow: hidden;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
`

export const PopperContainer = styled.div`
  position: relative;
  z-index: 50;
  padding-top: 2px;
  min-height: auto;
`
