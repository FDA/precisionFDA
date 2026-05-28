import React, { type PropsWithChildren } from 'react'
import ReactDOM from 'react-dom'
import { CSSTransition } from 'react-transition-group'
import styled, { css } from 'styled-components'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { useKeyPress } from '../../hooks/useKeyPress'
import { CloseButton, HeaderText, HeaderTop } from './modal.styles'

/**
 * Full-screen layer inside the modal where portaled popups (Combobox, etc.) can mount above the panel
 * while staying clickable. See https://github.com/mui/base-ui/issues/2854
 */
export const ModalFloatingPortalHostContext = React.createContext<HTMLDivElement | null>(null)

export function useModalFloatingPortalHost(): HTMLDivElement | null {
  return React.useContext(ModalFloatingPortalHostContext)
}

export const ModalContent = styled.div`
  --modal-padding-LR: 1.5rem;
  --modal-padding-TB: 1rem;
  --modal-border-radius: 0.5rem;

  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  background: var(--background);
  box-shadow: 0 3px 6px #00000029;
  border-radius: var(--modal-border-radius, 0.5rem);
  border: 1px solid var(--c-modal-border, transparent);
  min-width: 300px;
  max-width: 1000px;
  width: auto;
  outline: none;
  max-height: 90vh;
  overflow: hidden;

  &[data-variant='large'] {
    width: min(80%, 1000px);
    height: min(80vh, 800px);
    max-height: 700px;
  }
  &[data-variant='medium'] {
    width: min(80%, 800px);
  }
  &[data-variant='small'] {
    width: min(80%, 400px);
  }

  @media (max-width: 768px) {
    max-height: 95vh;
    min-width: 280px;
    
    &[data-variant='large'] {
      width: min(95%, 900px);
    }
    &[data-variant='medium'] {
      width: min(90%, 600px);
    }
    &[data-variant='small'] {
      width: min(85%, 400px);
    }
  }

  @media (max-height: 700px) {
    max-height: 98vh;
  }

  @media (max-width: 480px) {
    &[data-variant='large'],
    &[data-variant='medium'],
    &[data-variant='small'] {
      width: calc(100vw - 32px);
      min-width: 0;
    }
  }
`

export const ModalHeaderTop = ({
  hide,
  headerText,
  disableClose = false,
}: {
  hide?: () => void
  headerText?: React.ReactNode | string | number
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

/** Catches “click outside the panel” only — not a parent of portaled popups (Combobox, etc.). */
const ModalBackdrop = styled.button<{ $blur: boolean }>`
  box-sizing: border-box;
  position: fixed;
  inset: 0;
  z-index: 0;
  margin: 0;
  padding: 0;
  border: none;
  background-color: rgba(0, 0, 0, 0.3);
  cursor: pointer;

  ${({ $blur }) =>
    $blur &&
    css`
    backdrop-filter: blur(6px);
  `}
`

const StyledSuperModal = styled.div`
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
  nodeRef: React.RefObject<HTMLDivElement | null>
  zIndex?: number
}

export interface SuperModalProps extends ModalNextProps {
  nodeRef: React.RefObject<HTMLDivElement | null>
}

const SuperModalPortal = (props: PropsWithChildren<Omit<SuperModalProps, 'isShown'>>) => {
  // @ts-expect-error disableClose needs to be extracted from props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { nodeRef, variant, headerText, hide, children, blur = false, disableClose, zIndex, ...rest } = props
  const [floatingPortalHost, setFloatingPortalHost] = React.useState<HTMLDivElement | null>(null)
  useKeyPress('Escape', () => hide())
  return ReactDOM.createPortal(
    <ModalFloatingPortalHostContext.Provider value={floatingPortalHost}>
      <StyledSuperModal ref={nodeRef} style={{ zIndex }} {...rest}>
        <ModalBackdrop
          type="button"
          $blur={blur}
          aria-label="Close dialog"
          data-testid="modal-backdrop"
          onClick={hide}
        />
        <ModalContent
          aria-modal
          aria-label={headerText}
          tabIndex={-1}
          role="dialog"
          data-variant={variant}
          className="modalContent"
        >
          {children}
        </ModalContent>
        <div
          ref={setFloatingPortalHost}
          data-modal-floating-host
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 600,
            pointerEvents: 'none',
          }}
        />
      </StyledSuperModal>
    </ModalFloatingPortalHostContext.Provider>,
    document.getElementById('modal-root') ?? document.body,
    rest.id,
  )
}

export const ModalNext = (props: PropsWithChildren<Omit<ModalNextProps, 'nodeRef'>>) => {
  const nodeRef = React.useRef<HTMLDivElement>(null)
  const { isShown, ...restProps } = props
  return (
    <CSSTransition nodeRef={nodeRef} in={isShown} timeout={200} classNames="modal" unmountOnExit>
      <SuperModalPortal {...restProps} nodeRef={nodeRef}>
        {props.children}
      </SuperModalPortal>
    </CSSTransition>
  )
}
