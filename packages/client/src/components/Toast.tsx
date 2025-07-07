import React from 'react'
import { Link } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import styled from 'styled-components'

export interface ToastWithLinkProps {
  message: string
  linkUrl: string
  linkTitle: string
  linkTarget?: '_blank' | '_self'
}

// Styled components for custom toasts
const ToastContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distribute space between content and close button */
  width: 100%;
`

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* Space between message and link */
  flex-grow: 1; /* Allow content to take available space */

  div {
    font-weight: 500;
    color: inherit; /* Inherit color from toast type styles */
  }

  a {
    color: var(--c-link); /* Use your link color variable */
    text-decoration: none;
    font-size: 0.85rem;

    &:hover {
      text-decoration: underline;
      color: var(--c-link-hover);
    }
  }
`

export interface ToastWithLinkProps {
  message: string
  linkUrl: string
  linkTitle: string
  linkTarget?: '_blank' | '_self'
}

export const ToastWithLink = ({ message, linkUrl, linkTitle, linkTarget }: ToastWithLinkProps) => {
  return (
    <ToastContentWrapper>
      <MessageContent>
        <div>{message}</div>
        <Link to={linkUrl} target={linkTarget || '_self'}>
          {linkTitle}
        </Link>
      </MessageContent>
    </ToastContentWrapper>
  )
}

export const BasicToast = (message: string) => {
  return (
    <ToastContentWrapper>
      <MessageContent>
        <div>{message}</div>
      </MessageContent>
    </ToastContentWrapper>
  )
}
