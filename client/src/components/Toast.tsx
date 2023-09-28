import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import ReactTooltip from 'react-tooltip'
import { CloseAllIcon } from './icons/CloseAllIcon'


const CloseAllWrapper = styled.div`
  margin-left: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`

const CloseAll = styled.div`
  position: relative;
  top: -8px;
`

export interface ToastWithLinkProps {
  message: string,
  linkUrl: string,
  linkTitle: string,
}

export const ToastWithLink = ({ message, linkUrl, linkTitle }: ToastWithLinkProps) => {
  return (
      <>
        <div>
          <div>{message}</div>
          <Link to={linkUrl}>{linkTitle}</Link>
        </div>
        <CloseAllWrapper>
          <CloseAll data-tip data-for={`toast-tooltip-${message}`} onClick={() => toast.dismiss()}>
            <CloseAllIcon height={20}/></CloseAll>
          <ReactTooltip id={`toast-tooltip-${message}`} delayShow={1000} type='dark' effect='solid'>
            <span>Close all notifications</span>
          </ReactTooltip>
        </CloseAllWrapper>
      </>
  )
}

export const BasicToast = (message: string) => {
  return (
      <>
        <div>{message}</div>
        <CloseAllWrapper>
          <CloseAll data-tip data-for={`toast-tooltip-${message}`} onClick={() => toast.dismiss()}>
            <CloseAllIcon height={20}/></CloseAll>
          <ReactTooltip id={`toast-tooltip-${message}`} delayShow={1000} type='dark' effect='solid'>
            <span>Close all notifications</span>
          </ReactTooltip>
        </CloseAllWrapper>
      </>
  )
}