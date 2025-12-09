import styled from 'styled-components'
import { TransparentButton } from '../../components/Button'
import { compactScrollBarV2 } from '../../components/Page/styles'
import { Svg } from '../../components/icons/Svg'

export const HeaderTop = styled.div`
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--c-layout-border);
  padding: var(--modal-padding-TB) var(--modal-padding-LR);
`

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--c-layout-border);
  padding: 16px;
`
export const HeaderText = styled.div`
  align-self: center;
  font-size: 18px;
  font-weight: 600;
`
export const HeaderTextDetails = styled.div`
  font-size: 13px;
  font-weight: 400;
  margin-top: 8px;
`

export const CloseButton = styled(TransparentButton)`
  align-self: flex-start;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  border: none;
  border-radius: 3px;
  background: none;
  padding: 4px 5px;
  margin: 0;
  color: var(--c-text-600);
  &:hover {
    cursor: pointer;
    background-color: var(--tertiary-70);
    color: var(--c-text-900);
  }
  ${Svg} {
    transform: rotate(45deg);
  }
`
export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
`
export const Content = styled.div<{ $overflowContent?: boolean }>`
  ${({ $overflowContent = true }) => $overflowContent && 'overflow-y: scroll;'}
  margin: 24px;
`

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`
export const ModalScroll = styled.div`
  flex: 1;
  overflow-y: scroll;
  max-height: var(--modal-max-height, 50vh);
  ${compactScrollBarV2}
`

export const StyledModalScroll = styled(ModalScroll)`
  padding-left: 12px;
`

export const ModalScrollPadding = styled(ModalScroll)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: var(--modal-padding-LR);
  padding-top: var(--modal-padding-TB);
  padding-bottom: var(--modal-padding-TB);
`

export const StyledModalContent = styled.div`
  padding: 1rem;
  max-width: 600px;
`
export const ModalContentPadding = styled.div`
  padding: 12px;
`

export const ModalLoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`

export const ModalPageRow = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`

export const ModalPageCol = styled.div`
  align-self: stretch;
  min-width: 350px;
  width: 50vw;
  &:last-child {
    border: 0;
  }
`
