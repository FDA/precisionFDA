import React, { useEffect } from 'react'
import styled from 'styled-components'

const Content = styled.div``

export function AddIdsToHeaders({ docRef, content, as = 'div' }: { docRef: any, content: string, as?: any }) {
  useEffect(() => {
    if (docRef.current) {
      const headings = docRef.current.querySelectorAll('h1, h2, h3')

      headings.forEach((heading: any) => {
        heading.id = heading.getAttribute('id') || heading.innerText
          .toLowerCase()
          // eslint-disable-next-line no-useless-escape
          .replace(/[`~!@#$%^&*()_|+\-=?;:'\",.<>\{\}\[\]\\\/]/gi, '')
          .replace(/ +/g, '-')
      })

    }
  }, [docRef])
  
  return (
    <Content as={as} ref={docRef} dangerouslySetInnerHTML={{ __html: content }} />
  )
}
