import React, { FC } from 'react';
import ReactDOM from 'react-dom';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { useKeyPress } from '../../hooks/useKeyPress';
import {
  Wrapper,
  Header,
  StyledModal,
  HeaderText,
  CloseButton,
  Content,
  Backdrop,
  Footer,
} from './styles';
export interface ModalProps {
  isShown: boolean
  hide: () => void
  headerText: string
  footer?: React.ReactNode
  blur?: boolean
  disableClose?: boolean
}
const ModalComponent: FC<ModalProps> = ({ headerText, isShown, hide, children, footer, blur = false, disableClose = false, ...rest }) => {
  useKeyPress('Escape', () => hide())
  return (
    <React.Fragment>
      <Backdrop onClick={disableClose ? undefined : hide} blur={blur} />
      <Wrapper aria-modal aria-labelledby={headerText} tabIndex={-1} role="dialog" {...rest}>
        <StyledModal>
          <Header>
            <HeaderText>{headerText}</HeaderText>
            {!disableClose &&
              <CloseButton data-testid="modal-close-button" type="button" data-dismiss="modal" aria-label="Close" onClick={hide}>
                <PlusIcon height={16} />
              </CloseButton>
            }
          </Header>
          <Content>
            {children}
          </Content>
          {footer && <Footer>{footer}</Footer>}
        </StyledModal>
      </Wrapper>
    </React.Fragment>
  )
}
export const Modal: FC<ModalProps> = (props) => {
  return props.isShown ? ReactDOM.createPortal(
    <ModalComponent {...props}/>, document.body
  ) : null
}
