import styled from 'styled-components'
import { NavLink } from './NavLink'

export const StyledTabList = styled.div`
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    border-bottom: 1px solid var(--c-layout-border);
    padding-left: 16px;
`
export const StyledTab = styled(NavLink)`
    align-items: center;
    display: flex;
    box-sizing: border-box;
    height: 35px;
    padding: 5px 10px;
    background: var(--background-shaded);
    border: 1px solid var(--c-layout-border);
    border-bottom: 1px solid var(--c-layout-border);
    cursor: pointer;
    margin-left: 4px;
    margin-bottom: -1px;
    border-radius: 3px 3px 0 0;
    font-weight: 400;
    color: var(--c-text-700);
    font-size: 14px;
   
    &.active {
      background-color: var(--background);
      border-bottom: none;
    }
`

export const StyledTabPanel = styled.div`
    padding-top: 1rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`
