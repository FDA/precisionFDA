import styled, { css } from 'styled-components'

export const imageReset = css`
  max-width: 100%;
  height: auto;
  vertical-align: middle;
  font-style: italic;
  background-repeat: no-repeat;
  background-size: cover;
  shape-margin: 0.75rem;
`

export const StyledMarkdown = styled.div`
  font-size: 14px;
  align-self: stretch;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1rem 0;
    font-weight: bold;
  }

  h1 {
    font-size: 28px;
  }

  h2 {
    font-size: 21px;
  }

  h2 {
    font-size: 17.5px;
  }

  p {
    font-size: 14px;
    line-height: 1.6em;
    margin: 1em 0;
  }

  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }

  ul, ol {
    margin: 0.8em 0;
    padding-inline-start: 1rem;

    li {
      line-height: 1.6em;
    }
  }

  img {
    ${imageReset}
  }

  pre {
    font-family: Menlo, Consolas, Monaco, monospace;
    display: block;
    line-height: 1.53;
    font-size: 13px;
    margin: 0;
    margin-top: 8px;
    margin-bottom: 8px;
    overflow-x: auto;
    position: relative;
    tab-size: 2;
  }
  pre::-webkit-scrollbar {
    background: transparent;
    width: 10px;
  }
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  u {
    text-decoration: underline;
  }

  --c-doc-table-border: var(--c-layout-border-200);
  --c-doc-table-header-bg: var(--background-shaded);

  table {
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
        background-color: var(--c-doc-table-header-bg);
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
  }
`

export const FlexRow = styled.div`
  display: flex;
`
export const FlexCol = styled.div`
  display: flex;
  flex-direction: column;
`
