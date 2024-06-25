import React from 'react'
import styled from 'styled-components'
import { TransparentButton } from './Button'
import { headerPaddings } from './Header/styles'
import { CrossIcon } from './icons/PlusIcon'
import { alertTypesText } from '../features/admin/alerts/alerts.common'
import { AlertType } from '../features/admin/alerts/alerts.types'

const Message = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  text-wrap: pretty;
`

const Close = styled(TransparentButton)`
  justify-content: center;
  align-items: center;
  align-self: flex-start;
  display: flex;
  cursor: pointer;
  margin-top: 2px;
`

export const StyledAlertBanner = styled.div<{ 'data-variant': AlertType }>`
  --c-info: #f0c250;
  --c-warning: #e73a3a;

  background-color: var(--c-info);
  box-sizing: border-box;

  &[data-variant="warning"] {
    background-color: var(--c-warning);
    color: white;
  }
  &[data-variant="info"] {
    background-color: var(--c-info);
  }
  color: hsl(0, 0%, 20%);
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  gap: 16px;
  padding-top: 2px;
  padding-bottom: 2px;
  height: var(--site-alert-height);
  ${headerPaddings}
`

export const Variant = styled.span`
 text-transform: capitalize;
 font-weight: bolder;
 margin-right: 8px;
`

export const AlertBanner = ({ variant, alertText, dismissAlert }: { variant: AlertType, alertText?: string; dismissAlert: () => void }) => {
  if (!alert) return null

  const handleClose = () => {
    dismissAlert()
  }

  return (
    <StyledAlertBanner className='site-alert-banner' data-variant={variant}>
      <Message>
        <Variant>{alertTypesText[variant]}:</Variant> {alertText}
      </Message>
      <Close onClick={handleClose}>
        <CrossIcon height="14" />
      </Close>
    </StyledAlertBanner>
  )
}
