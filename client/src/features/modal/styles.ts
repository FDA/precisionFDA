import styled, { css } from 'styled-components'
import { Svg } from '../../components/icons/Svg'
import { colors, fontSize, fontWeight, sizing } from '../../styles/theme'

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
export const Backdrop = styled.div<{ blur: boolean }>`
  ${({ blur }) => blur && css`
    backdrop-filter: blur(8px);
  `}
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 500;
`
export const StyledModal = styled.div`
  z-index: 100;
  background: white;
  max-height: 70vh;

  border-radius: ${sizing.modalBorderRadius};
  display: flex;
  flex-direction: column;

  table {
    display: table;
    border-collapse: separate;
    box-sizing: border-box;
    text-indent: initial;
    border-spacing: 2px;
    border-color: grey;
  }
`
export const Header = styled.div`
`
export const HeaderTop = styled.div`
  border-radius: ${sizing.modalBorderRadius} ${sizing.modalBorderRadius} 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem; 
  border-bottom: 1px solid #e5e5e5;
  padding: 12px 24px;
  font-size: ${fontSize.h2};
  font-weight: ${fontWeight.bold};
  color: ${colors.textBlack};
`

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #e5e5e5;
  padding: 16px;
`
export const HeaderText = styled.div`
  align-self: center;
  color: #333333;
`
export const CloseButton = styled.button`
  font-size: 0.8rem;
  border: none;
  border-radius: 3px;
  margin-left: 0.5rem;
  background: none;
  padding: 0;
  margin: 0;
  color: #333333;
  :hover {
    cursor: pointer;
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
export const Content = styled.div<{ overflowContent?: boolean }>`
  ${({ overflowContent = true }) => overflowContent && 'overflow-y: scroll;'}
  padding: 12px;
`

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`
export const ModalScroll = styled.div`
  max-height: 50vh;
  overflow-y: scroll;
`

export const StyledModalContent = styled.div`
  padding: 1rem;
  max-width: 600px;
`

