import { createGlobalStyle } from 'styled-components'
import { compactScrollBarV2 } from '../components/Page/styles'
import { colors, theme } from './theme'
import { colorvars, themes } from './variables'

import './tailwind.css'

const GlobalStyle = createGlobalStyle<{ railsAlertHeight: number }>`
  ${colorvars}
  ${themes}

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
  html, body, #app-root {
    height: 100%;
    min-height: 0;
  }
  a {
    color: var(--c-link);
    text-decoration: none;

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

  body:has(.rails-alert) {
    --rails-alert-height: ${({ railsAlertHeight }) => railsAlertHeight}px;
  }
  #app-root:has(.site-alert-banner) {
    --site-alert-height: 20px;
  }

  @media (prefers-reduced-motion: no-preference) {
    :has(:target) {
      scroll-behavior: smooth;
      scroll-padding-top: 2rem;
    }
  }

  ::-webkit-scrollbar-corner { background: inherit; }

  &&&.Toastify__toast-container {
  }

  .Toastify__toast-body {
    padding: 0;
    width: 100%;
    font-weight: 400;
    font-size: 14px;
    margin: auto 12px !important;
    min-width: 400px !important;
    max-width: 600px !important;

    > div {
      display: flex;
    }
  }

  .Toastify__toast--error {
    border: 2px solid ${colors.primaryRed} !important;
    border-radius: 5px !important;
  }

  .Toastify__toast--success {
    border: 2px solid ${colors.highlightGreen} !important;
    border-radius: 5px !important;
  }

  .Toastify__toast--warning {
    border: 2px solid ${colors.primaryYellow} !important;
    border-radius: 5px !important;
  }

  /* Scroll modes - classes toggled by useScrollMode hook */
  html.scroll-main, html.scroll-main body, html.scroll-main #app-root {
    overflow: hidden;
  }
  html.scroll-main main {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  html.scroll-inner, html.scroll-inner body, html.scroll-inner #app-root, html.scroll-inner main {
    height: 100%;
    overflow: hidden;
  }
  html.scroll-inner {
    ${compactScrollBarV2}
  }
`

export default GlobalStyle
