import { createGlobalStyle } from 'styled-components'
import { colors, theme } from './theme'
import { colorvars, themes } from './variables'


const GlobalStyle = createGlobalStyle`
  ${colorvars}
  ${themes}

  * {
    margin: 0;
    padding: 0;
    font: inherit;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: "Lato", "Helvetica Neue", Helvetica, Arial, sans-serif;
    background-color: var(--background);
    color: var(--base);
  }
  #app-root {
    display: flex;
    flex-direction: column;
  }
  html {
    scroll-padding-top: 70px;
  }
  html, body, main, #app-root {
    height: 100%;
    min-height: 0;
  }
  a {
    color: var(--c-link);
    text-decoration: none;
    &:hover {
      color: var(--c-link-hover);
    }
  }
  main {
    display: flex;
    flex-direction: column;
  }

  :root {
    --toastify-color-info: ${colors.primaryBlue};
    --toastify-color-success: ${colors.highlightGreen};
    --toastify-color-warning: ${colors.primaryYellow};
    --toastify-color-error: ${colors.primaryRed};
    --toastify-toast-width: inherit;
  }

  /* Remove these when no longer referenced */
  .pfda-cursor-pointer {
    cursor: pointer
  }
  .pfda-loader {
    font-size: 36px
  }

  input[type="date"] { 
    background: white;
    border: 1px solid var(--c-input-border);
    padding: 4px 10px;
    font-family: ${theme.fontFamily};
  }

  img, picture, svg, video {
    display: block;
    max-width: 100%;
  }

  label, input, select, textarea, button {
    color: inherit;
  }
  h1, h2, h3, h4 {
    text-wrap: balance;
  }
  p {
    /* max-width: 72ch; */
    /* text-wrap: pretty; */
  }

  @media (prefers-reduced-motion: no-preference) {
    :has(:target) {
      scroll-behavior: smooth;
      scroll-padding-top: 2rem;
    }
  }

  ::-webkit-scrollbar-corner { background: inherit; }
`

export const ScrollableMainGlobalStyles = createGlobalStyle`
  html, body, #app-root {
    overflow: hidden;
  }
  main {
    overflow-y: auto;
  }
`

export const ScrollableInnerGlobalStyles = createGlobalStyle`
  html, body, #app-root, main {
    height: 100%;
    overflow: hidden;
  }
`
 
export default GlobalStyle
