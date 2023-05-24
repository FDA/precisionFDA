import React, { PropsWithChildren } from 'react'
import ReactDOM from 'react-dom'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { useKeyPress } from '../../hooks/useKeyPress'
import {
  Backdrop,
  CloseButton,
  HeaderText,
  HeaderTop,
  StyledModal,
  Wrapper,
} from './styles'

export const ModalHeaderTop = ({
  hide,
  headerText,
  disableClose = false,
}: {
  hide?: () => void
  headerText?: string
  disableClose?: boolean
}) => {
  return (
    <HeaderTop>
      <HeaderText>{headerText}</HeaderText>
      {!disableClose && (
        <CloseButton
          data-testid="modal-close-button"
          type="button"
          data-dismiss="modal"
          aria-label="Close"
          onClick={hide}
        >
          <PlusIcon height={16} />
        </CloseButton>
      )}
    </HeaderTop>
  )
}

export interface ModalNextProps {
  hide: () => void
  isShown: boolean
  headerText?: string
  blur?: boolean
  disableClose?: boolean
  id: string
}
const ModalComponent = (props: PropsWithChildren<ModalNextProps>) => {
  const {
    headerText,
    hide,
    children,
    blur = false,
    disableClose = false,
    ...rest
  } = props
  useKeyPress('Escape', () => hide())
  return (
    <>
      <Backdrop onClick={disableClose ? undefined : hide} blur={blur} />
      <Wrapper
        aria-modal
        aria-label={headerText}
        tabIndex={-1}
        role="dialog"
        {...rest}
      >
        <StyledModal>
          {children}
        </StyledModal>
      </Wrapper>
    </>
  )
}
// eslint-disable-next-line react/destructuring-assignment
export const ModalNext = ({ children, ...rest }: PropsWithChildren<ModalNextProps>) => rest.isShown
  ? ReactDOM.createPortal(<ModalComponent {...rest}>{children}</ModalComponent>, document.body)
  : null
