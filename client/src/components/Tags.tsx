import styled from 'styled-components'

export const StyledTags = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
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

export const StyledPropertyItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 4px 10px;
  background-color: #f6dab2;
  font-size: 12px;
  position: relative;

  &:before {
    content: "";
    position: absolute;
    width: 2px;
    height: 100%;
    top: 0;
    left: 0;
    background-color: #e6c69a;
  }
`

export const StyledPropertyKey = styled.span`
  font-weight: bold;
  margin-right: 8px;
`

