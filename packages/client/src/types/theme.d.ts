import 'styled-components'
import { Theme } from '../utils/ThemeContext'

declare module 'styled-components' {
  export interface DefaultTheme {
     colorMode: Theme;
  }
}