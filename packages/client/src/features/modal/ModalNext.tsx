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
  headerText?: JSX.Element | React.ReactNode | string | number
  disableClose?: boolean
}) => {
  return (
    <HeaderTop>
      {typeof headerText === 'function' ? headerText() : <HeaderText>{headerText}</HeaderText>}
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
  backdropZIndex?: number
  disableClose?: boolean
  id: string
}
const ModalComponent = (props: PropsWithChildren<Omit<ModalNextProps, 'isShown'>>) => {
  const {
    headerText,
    hide,
    children,
    blur = false,
    backdropZIndex,
    disableClose = false,
    ...rest
  } = props
  useKeyPress('Escape', () => hide())
  return (
    <>
      <Backdrop onClick={disableClose ? undefined : hide} $blur={blur} $backdropZIndex={backdropZIndex} />
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
export const ModalNext = ({ children, isShown, ...rest }: PropsWithChildren<ModalNextProps>) => isShown
  ? ReactDOM.createPortal(<ModalComponent {...rest}>{children}</ModalComponent>, document.body, rest.id)
  : null
