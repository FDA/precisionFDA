import React, { ReactNode, useState } from 'react'
import { ModalHeaderTop, ModalNext } from '../ModalNext'
import { Dialog, IDialogProps } from './Dialog'

type DialogComponentType = (props: IDialogProps) => React.ReactNode

export const useConfirm = ({
  onOk,
  body,
  DialogComponent = Dialog,
  headerText,
  okText = 'I understand',
  cancelText = 'Back',
  dataVariant = 'primary',
}:{
  onOk: () => void
  body: ReactNode
  DialogComponent?: DialogComponentType
  headerText?: string
  okText?: string
  cancelText?: string
  dataVariant?: 'primary' | 'success' | 'warning' | 'link'
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)

  const cancel = () => setIsOpen(false)

  const handleOk = () => {
    setIsOpen(false)
    onOk()
  }

  const ConfirmDialog = () => (
    <ModalNext id="confirm-modal" isShown={isOpen} hide={() => setIsOpen(false)}>
      <ModalHeaderTop headerText={headerText} hide={cancel} />
      <DialogComponent
        body={body}
        ok={handleOk}
        cancelText={cancelText}
        okText={okText}
        cancel={cancel}
        dataVariant={dataVariant}
      />
    </ModalNext>
  )

  const Confirm = () => (
    <>
      {isOpen && <ConfirmDialog />}
    </>
  )

  return {
    open,
    Confirm,
  }
}
