import styled, { css } from 'styled-components'
import { breakPoints } from '../../styles/theme'
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
  --c-doc-table-border: var(--c-layout-border-200);

  --c-doc-warning-bg: #fddbdc;
  --c-doc-warning-border: #e2b2b4;
  --c-doc-warning-color: #8c0808;

  --c-doc-tip-bg: #d9edf7;
  --c-doc-tip-border: #bce8f1;
  --c-doc-tip-color: #31708f;
  
  --c-doc-pre-bg: #f5f5f5;
  --c-doc-pre-border: #cccccc;

  --c-doc-code-bg: #f9f2f4;
  --c-doc-code-color: #c7254e;
  --c-doc-code-border: var(--c-layout-border-200);

  --c-doc-command-bg: #f4f4f4;
  --c-doc-command-color: #007bff;
  --c-doc-command-border: var(--c-layout-border-200);
  
${({ theme }) => theme.colorMode === 'dark' && css`

  --c-doc-warning-bg: #532626;
  --c-doc-warning-border: #7b4b4b;
  --c-doc-warning-color: #c69696;

  --c-doc-tip-bg: #264053;
  --c-doc-tip-border: #4b677b;
  --c-doc-tip-color: #96b6c6;
  
  --c-doc-pre-bg: #161616;
  --c-doc-pre-border: #474747;

  --c-doc-code-bg: var(--background);
  --c-doc-code-color: #c7254e;
  --c-doc-code-border: var(--c-layout-border-200);

  --c-doc-command-bg: #161616;
  --c-doc-command-color: var(--base);
  --c-doc-command-border: var(--c-layout-border-200);
`}

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
    background-color: var(--c-doc-pre-bg);
    border: 1px solid var(--c-doc-pre-border);
    border-radius: 3px;
    white-space: pre-line;
  }

  code {
    padding: 2px 4px;
    font-size: 90%;
    color: var(--c-doc-code-color);
    background-color: var(--c-doc-code-bg);
    border: 1px solid var(--c-doc-code-border);
    border-radius: 3px;
  }
  code, kbd, pre, samp {
      font-family: "PT Mono", Menlo, Monaco, Consolas, "Courier New", monospace;
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
    background-color: var(--primary-500);
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
  background-color: var(--c-doc-tip-bg);
  border-color: var(--c-doc-tip-border);
  color: var(--c-doc-tip-color);;

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
  border: 1px solid var(--c-doc-table-border);
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
    border-bottom: 2px solid var(--c-doc-table-border);

    th {
      border: 1px solid var(--c-doc-table-border);
      padding: 8px;
    }
  }

  tr {
    display: table-row;
    vertical-align: inherit;
    border-color: inherit;

    td {
      border: 1px solid var(--c-doc-table-border);
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

export const StyledOutdatedDocs = styled.div`
  color: var(--c-doc-warning-color);
  background-color: var(--c-doc-warning-bg);
  border: 1px solid var(--c-doc-warning-border);
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 32px;
`

export const HelpSection = styled.div`
  background-color: var(--c-doc-tip-bg);
  color: var(--c-doc-tip-color);
  border-radius: 5px;
  padding: 13px;
  position: relative;
  margin-bottom: 20px;

  &:before {
    height: 100%;
    width: 4px;
    content: "";
    background: #31708f;
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }
`

export const HelpTitle = styled.div`
  font-weight: bold;
  font-size: 1.2em;
  color: var(--c-doc-tip-color);
`

export const HelpTip = styled.p`
  color: var(--c-doc-tip-color);
  margin-left: 5px;
`

export const HelpTipText = styled.p`
  color: var(--c-doc-tip-color);
  margin-left: 10px;
`

export const ExampleBlock = styled.div`
    margin-bottom: 10px;
    font-family: 'Courier New', Courier, monospace;

    .description {
        font-style: italic;
    }

  .command {
    background-color: var(--c-doc-command-bg);
    color: var(--c-doc-command-color);
    padding: 5px 10px;
    margin-top: 5px;
  }
`

export const StyledCode = styled.code`
    background-color: var(--c-doc-command-bg);
    color: var(--c-doc-command-color);
    padding: 2px 4px;
    margin-top: 5px;
`
