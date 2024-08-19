import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { ButtonRow } from '../styles'
import { Button } from '../../../components/Button'

export const StyledConfirmDialog = styled.div`
  padding: 12px 12px 12px 24px;
  max-width: 400px;
`

export const StyledButtonRow = styled(ButtonRow)`
  margin-top: 16px;
`

export interface IDialogProps {
  body?: ReactNode
  ok: () => void
  okText?: string
  cancel: () => void
  cancelText?: string
}

export const Dialog = (props: IDialogProps) => {
  const { body, ok, okText, cancel, cancelText } = props

  return (
    <StyledConfirmDialog>
      {body}
      <StyledButtonRow>
        <Button onClick={cancel}>{cancelText || 'Cancel'}</Button>
        <Button data-variant="primary" onClick={ok}>{okText || 'Ok'}</Button>
      </StyledButtonRow>
    </StyledConfirmDialog>
  )
}
