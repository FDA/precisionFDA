/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Link as LinkType } from './types'

/* 
  This component is used to create a link that sends a POST request instead of a GET request.
  This way of linking was used by jquery which has been removed from all react code, however,
  we need to keep this functionality for some links still written in rails.
*/
function MagicPostLink({ link, children, confirm }: { link: LinkType, confirm?: string, children: React.ReactNode }) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (confirm && !window.confirm(confirm)) {
      return
    }

    if(typeof link === 'string') return
    const form = document.createElement('form')
    form.action = link.url
    form.method = 'POST'
    
    document.body.appendChild(form)
    form.submit()
  }

  return (
    <a data-turbolinks="false" onClick={handleClick}>
      {children}
    </a>
  )
}

export default MagicPostLink
