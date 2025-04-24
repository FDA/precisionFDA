import styled from "styled-components";

export const StyledInnerHTML = styled.div`
  flex: 1;
  max-width: 900px;
  font-size: 15px;
  color: var(--c-text-700);
  line-height: 1.7;
  font-weight: 400;

  img,
  picture,
  svg,
  video {
    display: inline-block;
  }

  details {
    background: var(--tertiary-50);
    border: 1px solid var(--tertiary-100);
    border-radius: 10px;
    margin-bottom: 8px;
  }
  summary {
    cursor: pointer;
    padding: 5px 5px 5px 20px;
    position: relative;
    font-weight: bold;
    outline: none;
  }
  [data-lexical-collapsible-content] {
    padding: 0 5px 5px 20px;
  }

  table,
  tbody,
  tr,
  td,
  th {
    border: 1px solid var(--c-layout-border) !important;
  }

  .PlaygroundEditorTheme__layoutItem {
    border: 0px;
  }

  h1,
  h2,
  h3,
  h4 {
    font-weight: bold;
    margin: 2.5rem 0 1.5rem 0;
  }
  h1 {
    font-size: 24px;
  }
  h2 {
    font-size: 20px;
  }
  h3 {
    font-size: 18px;
  }

  a {
      color: var(--primary-500);
      text-decoration: none;
  }
  a:hover, a:focus, a:active {
      text-decoration: underline;
  }

  p {
    margin: 0 0;
    line-height: 1.5rem;
    min-height: 1.5rem;
  }
  p code {
      background-color: #eee;
      padding: 0.05em 0.2em;
      border: 1px solid #ccc;
  }

  b {
    font-weight: bold;
  }

  ol, ul {
      margin: 1em;
  }
  ol li ol, ol li ul, ul li ol, ul li ul {
      margin: 0 2em;
  }
  ol li p, ul li p {
      margin: 0;
  }

  dl {
      font-family: monospace, monospace;
  }
  dl dt {
      font-weight: bold;
  }
  dl dd {
      margin: -1em 0 1em 1em;
  }

  img {
      height: auto;
      max-width: 100%;
      display: inline-block;
      margin: 0 auto;
  }

  blockquote {
      padding-left: 1em;
      font-style: italic;
      border-left: solid 1px #fa6432;
  }

  figure {
      margin: 1em 0;
  }
  figure figcaption {
      font-family: monospace, monospace;
      font-size: 0.75em;
      text-align: center;
      color: grey;
  }
  pre {
    color: var(--c-text-700);
    display: block;
    position: relative;
    padding-left: 3em;
  }

  pre:before {
    padding: 0;
  }
  pre > span[data-gutter] {
    display: block;
    position: relative;
    padding-left: 0.5em;

  }
  pre > span[data-gutter]::before {
    content: attr(data-gutter);
    display: inline-block;
    position: absolute;
    left: -2.5em;
    width: 2em;
    min-width: 2em;
    color: #888;
    text-align: right;
    user-select: none;
    font-variant-numeric: tabular-nums;
    background-color: #eee;
    top: 0;
    padding-right: 4px;
    border-right: 1px solid #ccc;
  }
`
