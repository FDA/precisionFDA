import React, { ReactNode, useState } from 'react'
import { ModalHeaderTop, ModalNext } from '../ModalNext'
import { Dialog, IDialogProps } from './Dialog'

type DialogComponentType = (props: IDialogProps) => JSX.Element

export const useConfirm = ({
  onOk,
  body,
  DialogComponent = Dialog,
  headerText,
  okText = 'I understand',
  cancelText = 'Back',
}:{
  onOk: () => void
  body: ReactNode
  DialogComponent?: DialogComponentType
  headerText?: string
  okText?: string
  cancelText?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)

  const cancel = () => setIsOpen(false)

  const handleOk = () => {
    setIsOpen(false)
    onOk()
  }

  const ConfirmDialog = () => (
    <ModalNext
      id="confirm-modal"
      isShown={isOpen}
      hide={() => setIsOpen(false)}
    >
      <ModalHeaderTop headerText={headerText} hide={cancel} />
      <DialogComponent body={body} ok={handleOk} cancelText={cancelText} okText={okText} cancel={cancel} />
    </ModalNext>
  )

  const Confirm = () => (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isOpen && <ConfirmDialog />}
    </>
  )

  return {
    open,
    Confirm,
  }
}
