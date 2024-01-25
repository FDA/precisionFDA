import styled from 'styled-components'
import { breakPoints, colors } from '../../styles/theme'
import { NavLink } from '../../components/NavLink'
import { compactScrollBarV2 } from '../../components/Page/styles'

export const DocsLayout = styled.div`
  display: flex;
  height: 0;
  flex: 1 0 auto;
`
export const ButtonRow = styled.div`
  display: flex;
  gap: 2px;
`
export const DocCallout = styled.div`
  border: 1px solid var(--c-layout-border);
  border-left-color: var(--primary-600);
  padding: 20px;
  margin: 20px 0;
  border-left-width: 5px;
  border-radius: 3px;
`
export const DocsMainContainer = styled.div`
  ${compactScrollBarV2}
  overflow-y: scroll;
  flex-grow: 1;
  justify-content: center;
`
export const DocsContent = styled.div`
  display: flex;
  flex: 1 1 auto;
  color: var(--c-text-700);
  font-size: 16px;
  padding: 0 16px;
  padding-top: 32px;
  box-sizing: border-box;

  color: var(--c-text-700);
  line-height: 1.45;
  font-weight: 400;
  font-size: 15px;

  ul, ol {
    list-style-position: inside;
  }
  li {
    text-wrap: pretty;
  }

  p {
    margin-top: 1rem;
    margin-bottom: 1rem;
    text-wrap: pretty;
  }

  h1, h2, h3, h4 {
    font-weight: bold;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  h1 {
    margin-bottom: 1rem;
    font-size: 32px;
    &:first-of-type {
      margin-top: 0rem;
    }
  }
  h2 {
    font-size: 20px;
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
    box-sizing: border-box;
    overflow: auto;
    display: block;
    padding: 9.5px;
    margin: 0 0 10px;
    font-size: 13px;
    line-height: 1.428571429;
    word-break: break-all;
    word-wrap: break-word;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 3px;
    white-space: pre-line;
  }
`
export const DocsNav = styled.div`
  ${compactScrollBarV2}
  border-right: 1px solid var(--c-layout-border-200);
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 300px;
  overflow: auto;
  padding-top: 16px;
  padding-bottom: 32px;
  font-size: 14px;
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

export const DocsPageContainer = styled.div`
  display: flex;
  align-items: stretch;
  flex: 1 1 auto;
  flex-direction: row;
  height: 0;
`

export const DocsTip = styled.div`
  background-color: #d9edf7;
  border-color: #bce8f1;
  color: #31708f;

  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  border-radius: 3px;
`

export const DocsTip2 = styled.div`
    background-color: #d9edf7;
    color: #31708f;
    padding: 15px;
    top: -3px;
    position: relative;
    margin-bottom: 20px;
    border: 2px solid #31708f;
    border-bottom-width: 5px;
    border-radius: 8px;
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
  min-height: calc(100vh - 65px);
`

export const DocsMainForFooter =  styled.div`
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
  font-size: 14px;
  position: sticky;
  height: 300px;
  top: 40px;
  padding: 0;
  margin: 0;
  list-style-type: none;
  line-height: 18px;

  li {
    margin-bottom: 8px;
    text-decoration: none;
    border-left: 1px solid transparent;
    padding-left: 16px;
    &:hover {
      border-left: 1px solid #2f7abc;
    }
  }
`
