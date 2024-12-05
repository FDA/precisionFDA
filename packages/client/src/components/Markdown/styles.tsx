import styled from 'styled-components'

export const MDStyles = styled.div`
  line-height: 1.6;
  margin: 0;
  padding: 0;

  h1,
  h2,
  h3 {
    font-weight: bold;
    margin: 1em 0 0.5em;
    line-height: 1.2;
  }

  h1 {
    font-size: 2em;
  }

  h2 {
    font-size: 1.75em;
  }

  h3 {
    font-size: 1.5em;
  }

  p {
    margin: 1em 0;
  }

  b {
    font-weight: bold;
  }

  ul {
    list-style-type: disc;
    margin: 1em 0 1em 1.5em;
    padding: 0;
  }

  ol {
    list-style-type: decimal;
    margin: 1em 0 1em 1.5em;
    padding: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
  }

  table th,
  table td {
    border: 1px solid var(--tertiary-50);
    padding: 0.5em;
    text-align: left;
  }

  table th {
    background-color: var(--background-shaded);
    font-weight: bold;
  }

  a {
    color: var(--c-link);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
  i,
  em {
    font-style: italic;
  }

  small {
    font-size: 0.85em;
    color: #555;
  }
  code {
    font-family: 'Courier New', monospace;
    background-color: #f4f4f4;
    padding: 0.2em;
    border-radius: 3px;
  }
  form {
    margin: 1em 0;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  hr {
    border: none;
    border-top: 1px solid var(--c-layout-border);
    margin: 2em 0;
  }
`
