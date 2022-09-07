import styled from 'styled-components';
export const ConfirmationButtons = styled.div`
  display: flex;
  justify-content: center;
`;
export const Message = styled.div`
  font-size: 0.9rem;
  margin-bottom: 10px;
  text-align: center;
`;
export const YesButton = styled.button`
  width: 6rem;
  background-color: yellow;
  :hover {
    background-color: red;
  }
`;
export const NoButton = styled.button`
  width: 3rem;
  background-color: lightgrey;
  :hover {
    background-color: grey;
  }
`;
