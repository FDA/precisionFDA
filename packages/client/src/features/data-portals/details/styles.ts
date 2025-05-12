import styled from 'styled-components'
import { compactScrollBarV2 } from '../../../components/Page/styles'

export const RightSideItem = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  line-height: 20px;
  color: var(--c-text-500);
  padding-bottom: 24px;
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

export const DPSettings = styled.div`
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
