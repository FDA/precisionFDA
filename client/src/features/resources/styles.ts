import styled from "styled-components";

export const FileThumb = styled.div`
  display: grid;
  justify-content: end;
  align-items: center;

  svg {
    grid-area: 1 / 1;
  }

  .ext {
    grid-area: 1 / 1;
    text-align: center;
  }
`