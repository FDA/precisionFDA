import styled, { createGlobalStyle } from 'styled-components';
import { colors } from './theme';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: "Lato", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  #app-root {
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
`;

export const LayoutBody = styled.div`
`
 
export default GlobalStyle;
