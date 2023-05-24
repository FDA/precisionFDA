import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { Link } from 'react-router-dom'

export interface ToastWithLinkProps {
  message: string,
  linkUrl: string,
  linkTitle: string,
}

export const ToastWithLink = ({ message, linkUrl, linkTitle }: ToastWithLinkProps) => {
  return (
    <div>
      <div>{message}</div>
      <Link to={linkUrl}>{linkTitle}</Link>
    </div>
  )
}
