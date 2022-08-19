import React from 'react'

import { UserContentDisplay } from './UserContentDisplay'
import { IOutlineAnchor, UserContentOutline } from './UserContentOutline'
import { theme } from '../../../styles/theme'


// Stripping HTML code in case user inserts links in the header
// See https://jira.internal.dnanexus.com/browse/PFDA-2396
//
export const stripHTML = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

// UserContent analyses user HTML content, for example an expert blog or
// the introduction and results content of a challenge, inserting anchors and
// creating an outline component that allows user quick access to a section
//
class UserContent {
  anchors: IOutlineAnchor[] = []

  userContentHTML = ''

  constructor(htmlContent: string, isLoggedIn: boolean) {
    // We extract <h1> and <h2> tags for the any user content
    // to create href anchors and buttons to navigate to them in the side bar
    //
    const el = document.createElement('html')
    el.innerHTML = htmlContent

    const headingElements = el.querySelectorAll('h1, h2')

    let anchorId = 0
    const getNextAnchorId = (content: string) => {
      anchorId += 1
      const maxAnchorIdLength = 20
      let slug = stripHTML(content).replace(/ /g, '_')
      slug = encodeURIComponent(slug.slice(0, maxAnchorIdLength))
      const idTagContent = `${anchorId.toString()  }__${  slug}`
      return idTagContent
    }

    const anchors = Array.from(headingElements).map((ael) => {
      const tag = ael.tagName
      const content = (ael.innerHTML ? ael.innerHTML.trim() : '')
      const aId = getNextAnchorId(content)

      // If user is not logged in, add a hidden anchor element to take the sticky header
      // into account by inserting a hidden anchor to scroll to
      if (isLoggedIn) {
        ael.setAttribute('id', aId)
      }
      else {
        const hiddenAnchor = document.createElement('section')
        hiddenAnchor.setAttribute('id', aId)
        hiddenAnchor.style.position = 'relative'
        hiddenAnchor.style.top = `-${theme.values.navigationBarHeight+theme.values.contentMargin}px`
        hiddenAnchor.style.visibility = 'hidden'
        hiddenAnchor.style.zIndex = '321'
        el.parentElement?.insertBefore(hiddenAnchor, ael)
      }

      return { 'tag': tag.toLowerCase(), 'content': stripHTML(content), 'anchorId': aId }
    })

    this.anchors = anchors
    this.userContentHTML = el.innerHTML
  }

  createOutlineElement() {
    return <UserContentOutline anchors={this.anchors} />
  }

  createDisplayElement() {
    return <UserContentDisplay html={this.userContentHTML} />
  }
}

export default UserContent
