import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle<{ railsAlertHeight: number }>`
  body:has(.rails-alert) {
    --rails-alert-height: ${({ railsAlertHeight }) => railsAlertHeight}px;
  }
`

export default GlobalStyle
