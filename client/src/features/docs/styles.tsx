import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { colors } from '../../styles/theme'

export const DocsLayout = styled.div`
  display: flex;
  height: auto;
  /* overflow: scroll; */
`
export const ButtonRow = styled.div`
  display: flex;
  gap: 2px;
`
export const DocCallout = styled.div`
  border: 1px solid #eee;
  border-left-color: #428bca;
  background: #fafafa;
  padding: 20px;
  margin: 20px 0;
  border-left-width: 5px;
  border-radius: 3px;
`
export const DocsContent = styled.main`
  display: flex;
  flex: 1 1 auto;
  color: #333333;
  line-height: 1.428571429;
  font-size: 16px;
  overflow-y: auto;
  box-sizing: border-box;

  p {
    margin-top: 8px;
  }

  h1 {
    margin-top: 0.5rem;
    margin-bottom: 2rem;
    font-size: 32px;
    color: #333333;
  }
  h2 {
    margin-bottom: 8px;
  }

  code {
    padding: 2px 4px;
    font-size: 90%;
    color: #c7254e;
    background-color: #f9f2f4;
    border-radius: 3px;
  }

  pre {
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    box-sizing: border-box;
    overflow: auto;
    display: block;
    padding: 9.5px;
    margin: 0 0 10px;
    font-size: 13px;
    line-height: 1.428571429;
    word-break: break-all;
    word-wrap: break-word;
    color: #333333;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 3px;
    white-space: pre-line;
  }
`
export const DocsNav = styled.nav`
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 300px;
  background-color: #f2f2f2;
  color: #333333;
  overflow: auto;
  padding-top: 16px;
  padding-bottom: 32px;
`

export const NavItem = styled(NavLink)<{$active?: boolean}>`
  padding: 8px 16px 8px 32px;
  
  &.active {
    background-color: ${colors.primaryBlue};
    color: #ffffff;
  }

`
export const DocsTitle = styled.div`
  padding: 8px 16px 8px 32px;
  font-weight: bold;
`

export const DocsPageContainer = styled.div``

export const DocsTip = styled.div`
  background-color: #d9edf7;
  border-color: #bce8f1;
  color: #31708f;

  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  border-radius: 3px;
`

export const VideoWrapper = styled.div`
  padding-bottom: 48px;
  overflow: hidden;
  iframe {
    min-height: 360px;
  }
`

export const DocBody = styled.div`
  width: 100%;
  max-width: 820px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 32px;
  padding-right: 32px;
  padding-bottom: 48px;
  padding-top: 16px;
`
export const DocTable = styled.table`
  border: 1px solid #ddd;
  width: 100%;
  max-width: 100%;
  margin-bottom: 20px;
  border-collapse: collapse;
  border-spacing: 0;

  * {
    box-sizing: border-box;
  }

  thead {
    text-align: left;
    vertical-align: middle;
    border-bottom: 2px solid #ddd;

    th {
      border: 1px solid #ddd;
      padding: 8px;
    }
  }

  tr {
    display: table-row;
    vertical-align: inherit;
    border-color: inherit;

    td {
      border: 1px solid #ddd;
      padding: 8px;
      line-height: 1.428571429;
      vertical-align: top;
    }
  }
`
