import styled from 'styled-components'
import { compactScrollBar } from './Page/styles'

export const StyledTags = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

  ${compactScrollBar}
`

export const StyledTagItem = styled.div`
  background-color: var(--c-property-item);
  color: #333;
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
    border-color: transparent var(--c-property-item) transparent transparent;
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
  background-color: var(--c-property-item);
  font-size: 12px;
  position: relative;
  color: #333;

  &:before {
    content: "";
    position: absolute;
    width: 2px;
    height: 100%;
    top: 0;
    left: 0;
    background-color: var(--c-property-item);
  }
`

export const StyledPropertyKey = styled.span`
  font-weight: bold;
  margin-right: 8px;
`

