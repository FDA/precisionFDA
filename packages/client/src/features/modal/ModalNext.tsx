import React, { PropsWithChildren } from 'react'
import ReactDOM from 'react-dom'
import { CSSTransition } from 'react-transition-group'

import styled from 'styled-components'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { useKeyPress } from '../../hooks/useKeyPress'
import { CloseButton, HeaderText, HeaderTop } from './styles'

export const ModalContent = styled.div`
  --modal-padding-LR: 1.5rem;
  --modal-padding-TB: 1rem;
  --modal-border-radius: 0.5rem;

  display: flex;
  flex-direction: column;
  background: var(--background);
  width: var(--modal-width, 60%);
  box-shadow: 0px 3px 6px #00000029;
  border-radius: var(--modal-border-radius, 0.5rem);
  border: 1px solid var(--c-modal-border, transparent);
  min-width: 300px;
  max-width: 1000px;
  width: auto;
  outline: none;

  &[data-variant='large'] {
    width: min(80%, 900px);
  }
  &[data-variant='medium'] {
    width: min(80%, 600px);
  }
  &[data-variant='small'] {
    width: min(80%, 400px);
  }
`

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
        <CloseButton data-testid="modal-close-button" type="button" data-dismiss="modal" aria-label="Close" onClick={hide}>
          <PlusIcon height={16} />
        </CloseButton>
      )}
    </HeaderTop>
  )
}

const StyledSuperModal = styled.div<{'data-blur': 'true' | 'false' }>`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 500;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.3);
  
  [data-blur] {
    backdrop-filter: blur(6px);
  }
  &.modal-enter {
    opacity: 0;
  }
  &.modal-enter-active {
    opacity: 1;
    transition: all 0.2s;
  }
  &.modal-exit {
    opacity: 1;
  }
  &.modal-exit-active {
    opacity: 0;
    transition: all 0.2s;
  }

  .modal-enter .modalContent {
    opacity: 0;
    transform: scale(0.9);
  }
  .modal-enter-active .modalContent {
    opacity: 1;
    transform: translateX(0);
    transition: all 0.2s;
  }
  .modal-exit .modalContent {
    opacity: 1;
  }
  .modal-exit-active .modalContent {
    opacity: 0;
    transform: scale(0.9);
    transition: all 0.2s;
  }
`

export interface ModalNextProps {
  hide: () => void
  isShown: boolean
  headerText?: string
  variant?: 'large' | 'small' | 'medium'
  blur?: boolean
  id: string
  nodeRef: React.RefObject<HTMLDivElement>
}

export interface SuperModalProps extends ModalNextProps {
  nodeRef: React.RefObject<HTMLDivElement>
}

const SuperModalPortal = (props: PropsWithChildren<Omit<SuperModalProps, 'isShown'>>) => {
  const { nodeRef, variant, headerText, hide, children, blur = false, ...rest } = props
  useKeyPress('Escape', () => hide())
  return ReactDOM.createPortal(
    <StyledSuperModal onClick={hide} ref={nodeRef} data-blur={blur.toString() as BooleanString} {...rest}>
      <ModalContent
        aria-modal
        aria-label={headerText}
        tabIndex={-1}
        role="dialog"
        data-variant={variant}
        className='modalContent'
        onClick={e => e.stopPropagation()}
      >
        {children}
      </ModalContent>
    </StyledSuperModal>,
    document.getElementById('modal-root')!,
    rest.id,
  )
}

export const ModalNext = (props: PropsWithChildren<Omit<ModalNextProps, 'nodeRef'>>) => {
  const nodeRef = React.useRef(null)
  const { isShown, ...restProps } = props
  return (
    <CSSTransition nodeRef={nodeRef} in={isShown} timeout={200} classNames="modal" unmountOnExit>
      <SuperModalPortal {...restProps} nodeRef={nodeRef}>{props.children}</SuperModalPortal>
    </CSSTransition>
  )
}

