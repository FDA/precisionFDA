import styled from 'styled-components'

export const StyledTags = styled.div`
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 10px;

  &:hover {
  /* width */
  ::-webkit-scrollbar {
    height: 5px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #888;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  }


`

export const StyledTagItem = styled.div`
  background-color: #f6dab2;
  padding: 5px;
  position: relative;
  line-height: 12px;
  font-size: 12px;
  margin-left: 10px;

  &:before {
    content: "";
    width: 0px;
    height: 0px;
    border-style: solid;
    border-width: 11px 10px 11px 0;
    border-color: transparent #f6dab2 transparent transparent;
    position: absolute;
    top: 0;
    left: -10px;
  }
`
