import React, { FC, ReactNode } from 'react'
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
  disableClose,
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
  children: ReactNode
}
const ModalComponent = (props: ModalNextProps) => {
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
          {React.Children.map(children, child => (
            React.cloneElement(child, { ...props })
          ))}
        </StyledModal>
      </Wrapper>
    </>
  )
}
// eslint-disable-next-line react/destructuring-assignment
export const ModalNext: FC<ModalNextProps> = props => props.isShown
  ? ReactDOM.createPortal(<ModalComponent {...props} />, document.body)
  : null
