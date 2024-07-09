import styled from 'styled-components'
import { compactScrollBarV2 } from '../../../components/Page/styles'

export const RightSideItem = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  line-height: 20px;
  color: var(--c-text-500);
  padding-bottom: 32px;
  border-bottom: 1px solid var(--tertiary-200);
`
export const RightSideScroll = styled.div`
  ${compactScrollBarV2}
  margin: 2px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-right: 1px solid var(--c-layout-border-200);
  width: 330px;
  min-width: 330px;

  ${RightSideItem}:last-child {
    border-bottom: 0;
  }
`

export const Row = styled.div`
  display: flex;
  align-items: stretch;
  flex: 1 1 auto;
  flex-direction: row;
  height: 0;
`
export const PageWrap = styled.div`
  position: relative;
  justify-content: center;
  flex: 1 1 auto;
  margin-inline: auto;
  ${compactScrollBarV2}
  overflow-y: scroll;
`
export const DataPortalPageMainBody = styled.div`
  padding: 32px;
  justify-content: center;
  display: flex;
  flex-grow: 1;
`
export const BodyContent = styled.div`
  max-width: 1000px;
  flex: 1;
`
export const StyledInnerHTML = styled.div`
  flex: 1;
  max-width: 900px;
  font-size: 15px;
  color: var(--c-text-700);
  line-height: 1.7;
  font-weight: 400;

  img,
  picture,
  svg,
  video {
    display: inline-block;
  }

  details {
    background: var(--tertiary-50);
    border: 1px solid var(--tertiary-100);
    border-radius: 10px;
    margin-bottom: 8px;
  }
  summary {
    cursor: pointer;
    padding: 5px 5px 5px 20px;
    position: relative;
    font-weight: bold;
    outline: none;
  }
  [data-lexical-collapsible-content] {
    padding: 0 5px 5px 20px;
  }

  table,
  tbody,
  tr,
  td,
  th {
    border: 1px solid var(--c-layout-border) !important;
  }

  .PlaygroundEditorTheme__layoutItem {
    border: 0px;
  }

  h1,
  h2,
  h3,
  h4 {
    font-weight: bold;
  }
  h1 {
    font-size: 24px;
  }
  h2 {
    font-size: 20px;
  }
  h3 {
    font-size: 18px;
  }
`
