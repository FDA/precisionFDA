import React, { ReactNode, useState } from 'react'
import { ModalHeaderTop, ModalNext } from '../ModalNext'
import { Dialog, IDialogProps } from './Dialog'

type DialogComponentType = (props: IDialogProps) => JSX.Element

export const useConfirm = (
  callback: () => void,
  body: ReactNode,
  DialogComponent: DialogComponentType = Dialog,
) => {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)

  const cancel = () => setIsOpen(false)

  const ok = () => {
    setIsOpen(false)
    callback()
  }

  const ConfirmDialog = () => (
    <ModalNext
      isShown={isOpen}
      hide={() => setIsOpen(false)}
    >
      <ModalHeaderTop />
      <DialogComponent body={body} ok={ok} cancelText="Back" okText="I understand" cancel={cancel} />
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
