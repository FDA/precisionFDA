import styled, { createGlobalStyle } from 'styled-components'
import { colors, theme } from './theme'

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: "Lato", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  #app-root {
    display: flex;
    flex-direction: column;
  }
  html {
    scroll-padding-top: 70px;
  }
  html, body, main, #app-root, .pfda-loader-wrapper {
    height: 100%;
  }
  a {
    color: ${colors.primaryBlue};
    text-decoration: none;
    &:hover {
      color: #4297df;
    }
  }
  .pfda-loader-wrapper {
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
    border: 1px solid #d9d9d9;
    padding: 4px 10px;
    font-family: ${theme.fontFamily};
  }
`

export const LayoutBody = styled.div`
`
 
export default GlobalStyle
