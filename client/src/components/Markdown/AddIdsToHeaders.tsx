import React, { useEffect } from 'react'

export function AddIdsToHeaders({ docRef, content }: { docRef: any, content: string }) {
  useEffect(() => {
    if (docRef.current) {
      const headings = docRef.current.querySelectorAll('h1, h2, h3')

      headings.forEach((heading: any) => {
        // eslint-disable-next-line no-param-reassign
        heading.id = heading.getAttribute('id') || heading.innerText
          .toLowerCase()
          // eslint-disable-next-line no-useless-escape
          .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
          .replace(/ +/g, '-')
      })
    }
  }, [docRef])
  
  return (
    <div ref={docRef} dangerouslySetInnerHTML={{ __html: content }} />
  )
}
