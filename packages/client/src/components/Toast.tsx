import React from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
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
  linkTarget?: '_blank' | '_self'
}

export const ToastWithLink = ({ message, linkUrl, linkTitle, linkTarget }: ToastWithLinkProps) => {
  return (
    <>
      <div>
        <div>{message}</div>
        <Link to={linkUrl} target={linkTarget || '_self'}>
          {linkTitle}
        </Link>
      </div>
      <CloseAllWrapper>
        <CloseAllWithLink
          data-tooltip-id={`toast-tooltip-${message}`}
          data-tooltip-content="Close all notifications"
          onClick={() => toast.dismiss()}
        >
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
        <CloseAllBasic
          data-tooltip-id={`toast-tooltip-${message}`}
          data-tooltip-content="Close all notifications"
          onClick={() => toast.dismiss()}
        >
          <CloseAllIcon height={20} />
        </CloseAllBasic>
        <Tooltip id={`toast-tooltip-${message}`} delayShow={1000} />
      </CloseAllWrapper>
    </>
  )
}
