import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

export const StyledTabList = styled.div`
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    border-bottom: 1px solid #DDDDDD;
    padding-left: 16px;
`
export const StyledTab = styled(NavLink)`
    box-sizing: border-box;
    height: 35px;
    padding: 5px 10px;
    background: #F2F2F2;
    border: 1px solid #DDDDDD;
    border-bottom: 1px solid #DDDDDD;
    cursor: pointer;
    margin-left: 10px;
    margin-bottom: -1px;
    border-radius: 3px 3px 0 0;
    font-weight: 400;
    color: #272727;
    font-size: 14px;
   
    &.active {
      background-color: #fff;
      border-bottom: none;
    }
`

export const StyledTabPanel = styled.div`
    margin-top: 1rem;
`
