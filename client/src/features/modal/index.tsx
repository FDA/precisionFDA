import React, { FC, ReactNode } from 'react'
import ReactDOM from 'react-dom'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { useKeyPress } from '../../hooks/useKeyPress'
import {
  Wrapper,
  Header,
  StyledModal,
  HeaderText,
  CloseButton,
  Content,
  Backdrop,
  Footer,
  HeaderTop,
} from './styles'

export interface ModalProps {
  id: string
  isShown: boolean
  hide: () => void
  headerText: string
  title?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  blur?: boolean
  disableClose?: boolean
  overflowContent?: boolean
  children: ReactNode
}

const ModalComponent = ({ header, headerText, isShown, hide, children, footer, blur = false, disableClose = false, overflowContent = true, ...rest }: ModalProps) => {
  useKeyPress('Escape', () => hide())
  return (
    <>
      <Backdrop onClick={disableClose ? undefined : hide} $blur={blur} />
      <Wrapper aria-modal aria-label={headerText} tabIndex={-1} role="dialog" {...rest}>
        <StyledModal>
          <Header>
            <HeaderTop>
              <HeaderText>{headerText}</HeaderText>
              {!disableClose &&
                <CloseButton data-testid="modal-close-button" type="button" data-dismiss="modal" aria-label="Close" onClick={hide}>
                  <PlusIcon height={16} />
                </CloseButton>
              }
            </HeaderTop>
            {header && <div>{header}</div>}
          </Header>
          <Content $overflowContent={overflowContent}>
            {children}
          </Content>
          {footer && <Footer>{footer}</Footer>}
        </StyledModal>
      </Wrapper>
    </>
  )
}
// eslint-disable-next-line react/destructuring-assignment
/** @deprecated use ModalNext component instead */
export const Modal: FC<ModalProps> = (props) => props.isShown ? ReactDOM.createPortal(
    <ModalComponent {...props} />, document.body,
  ) : null
