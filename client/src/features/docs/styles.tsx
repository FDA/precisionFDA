import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { breakPoints, colors } from '../../styles/theme'

export const DocsLayout = styled.div`
  display: flex;
  height: auto;
  flex: 1 0 auto;
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
  padding: 0 16px;
  padding-top: 32px;
  box-sizing: border-box;

  p {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  h1 {
    margin-top: 3rem;
    margin-bottom: 1rem;
    font-size: 32px;
    color: #333333;
  }
  h2, h3, h4 {
    margin-top: 2.5rem;
    margin-bottom: 1rem;
  }

  code.inline {
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
  padding-bottom: 48px;
`

export const RightSide = styled.div`
  flex: 1 0 auto;
  display: none;
  flex-direction: column;
`

export const DocRow = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column-reverse;
  padding: 0 16px 64px 16px;
  @media (min-width: ${breakPoints.large}px) {
    gap: 32px;
    flex-direction: row;
    justify-content: space-between;
    ${RightSide} {
      display: flex;
      flex: 0 1 auto;
      min-width: 256px;
      max-width: 256px;
    }
  }
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

export const PageMap = styled.ol`
  position: sticky;
  height: 300px;
  top: 83px;
  padding: 0;
  margin: 0;
  list-style-type: none;
  font-size: 16px;
  line-height: 20px;

  li {
    margin-bottom: 16px;
    text-decoration: none;
    border-left: 1px solid transparent;
    padding-left: 16px;
    &:hover {
      border-left: 1px solid #2f7abc;
    }
  }
`
