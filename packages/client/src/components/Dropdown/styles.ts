import styled from 'styled-components'
import { theme } from '../../styles/theme'


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

export const TablePopperContainer = styled.div`
  z-index: 50;
  padding-top: 2px;
  min-height: auto;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  min-height: 40px;
  background-color: #fff;


.item {
  margin: 0 8px 0 8px;
  padding: 8px;
  color: #050505;
  cursor: pointer;
  line-height: 16px;
  font-size: 15px;
  display: flex;
  align-content: center;
  flex-direction: row;
  flex-shrink: 0;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 8px;
  border: 0;
  max-width: 250px;
  min-width: 100px;
}

.item.fontsize-item,
.item.fontsize-item .text {
  min-width: unset;
}

.item .active {
  display: flex;
  width: 20px;
  height: 20px;
  background-size: contain;
}

.item:first-child {
  margin-top: 8px;
}

.item:last-child {
  margin-bottom: 8px;
}

.item:hover {
  background-color: #eee;
}

.item .text {
  display: flex;
  line-height: 20px;
  flex-grow: 1;
  min-width: 150px;
}

.item .icon {
  display: flex;
  width: 20px;
  height: 20px;
  user-select: none;
  margin-right: 12px;
  line-height: 16px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.divider {
  width: auto;
  background-color: #eee;
  margin: 4px 8px;
  height: 1px;
}

@media screen and (max-width: 1100px) {
  .dropdown-button-text {
    display: none !important;
  }
  .font-size .dropdown-button-text {
    display: flex !important;
  }
  .code-language .dropdown-button-text {
    display: flex !important;
  }
}
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
