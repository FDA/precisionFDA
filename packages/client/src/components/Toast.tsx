import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Tooltip } from 'react-tooltip'
import { CloseAllIcon } from './icons/CloseAllIcon'

const CloseAllWrapper = styled.div`
  margin-left: auto;
`

const CloseAllBasic = styled.div`
  position: relative;
  top: -8px;
`

const CloseAllWithLink = styled.div`
  position: relative;
  top: 0;
`
export interface ToastWithLinkProps {
  message: string
  linkUrl: string
  linkTitle: string
}

export const ToastWithLink = ({ message, linkUrl, linkTitle }: ToastWithLinkProps) => {
  return (
    <>
      <div>
        <div>{message}</div>
        <Link to={linkUrl}>{linkTitle}</Link>
      </div>
      <CloseAllWrapper>
        <CloseAllWithLink data-tooltip-id={`toast-tooltip-${message}`} data-tooltip-content="Close all notifications" onClick={() => toast.dismiss()}>
          <CloseAllIcon height={20} />
        </CloseAllWithLink>
        <Tooltip id={`toast-tooltip-${message}`} delayShow={1000} />
      </CloseAllWrapper>
    </>
  )
}

export const BasicToast = (message: string) => {
  return (
    <>
      <div>{message}</div>
      <CloseAllWrapper>
        <CloseAllBasic data-tooltip-id={`toast-tooltip-${message}`} data-tooltip-content="Close all notifications" onClick={() => toast.dismiss()}>
          <CloseAllIcon height={20} />
        </CloseAllBasic>
        <Tooltip id={`toast-tooltip-${message}`} delayShow={1000} />
      </CloseAllWrapper>
    </>
  )
}
