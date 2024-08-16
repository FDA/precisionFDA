import styled, { css } from 'styled-components'
import { TransparentButton } from '../../components/Button'
import { compactScrollBarV2 } from '../../components/Page/styles'
import { Svg } from '../../components/icons/Svg'
import { fontSize, fontWeight, sizing } from '../../styles/theme'

export const Wrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 700;
  outline: 0;
  width: fit-content;
  min-width: 400px;
  max-height: max(100% - 232px, 90%);
`
export const Backdrop = styled.div<{ $blur: boolean; $backdropZIndex?: number }>`
  ${({ $blur }) =>
    $blur &&
    css`
      backdrop-filter: blur(8px);
    `}
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 500;
  ${({ $backdropZIndex }) =>
    $backdropZIndex &&
    css`
      z-index: ${$backdropZIndex};
    `}
`
export const StyledModal = styled.div`
  --modal-padding-LR: 1.5rem;
  --modal-padding-TB: 1rem;
  --modal-border-radius: 0.5rem;

  color: var(--c-text-700);
  z-index: 100;
  background: var(--background);
  border-radius: ${sizing.modalBorderRadius};
  display: flex;
  flex-direction: column;
  border: 1px solid var(--c-modal-border, transparent);

  table {
    display: table;
    border-collapse: separate;
    box-sizing: border-box;
    text-indent: initial;
    border-spacing: 2px;
    border-color: grey;
  }
`
export const Header = styled.div``
export const HeaderTop = styled.div`
  border-radius: ${sizing.modalBorderRadius} ${sizing.modalBorderRadius} 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem;
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
  font-size: ${fontSize.h2};
  font-weight: ${fontWeight.bold};
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

export const StyledHeading = styled.div`
  font-weight: bolder;
  font-size: 16px;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
`

export const Sticky = styled.div`
  position: sticky;
  top: 0;
  background-color: var(--background);
`

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  min-height: 120px;
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

export const ScrollPlace = styled.div`
  ${compactScrollBarV2}
  overflow-y: auto;
  max-height: 50vh;
  min-height: 50vh;
`

export const ModalPageRow = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`

export const ModalPageCol = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
  align-self: stretch;
  min-width: 350px;
  width: 40vw;
  height: 100%;
  border-right: 1px solid var(--c-layout-border-200);
  &:last-child {
    border: 0;
  }
`
