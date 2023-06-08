import React, { FunctionComponent } from 'react'
import { HashLink } from 'react-router-hash-link'
import styled from 'styled-components'

import { theme } from '../../../../styles/theme'
import CollapsibleMenu from '../../CollapsibleMenu'

const StyledUserContentOutline = styled.div`
  width: 100%;

  .outline-item-h1 {
    margin-top: 3px;

    a {
      color: ${theme.colors.textDarkGrey};
      font-weight: 400;
      font-size: ${theme.fontSize.subheading};
      margin-top: 12px;

      &:hover {
        color: ${theme.colors.textMediumGrey};
      }
    }
  }
`

const OutlineItemH2 = styled.div`
  margin-top: 3px;
  margin-left: 16px;

  a {
    color: ${theme.colors.textDarkGrey};
    font-weight: 400;
    font-size: ${theme.fontSize.subheading};
    margin-top: 12px;

    &:hover {
      color: ${theme.colors.textMediumGrey};
    }
  }
`

interface IOutlineAnchor {
  tag: string
  content: string
  anchorId?: string
  action?: () => void
}

interface IUserContentOutline {
  anchors: IOutlineAnchor[]
}

export const UserContentOutline: FunctionComponent<IUserContentOutline> = ({
  anchors,
}) => {
  // Translate the flat list of h1, h2, etc tags into hierarchical menu structure
  // that can be converted to a list of CollapsibleMenu components
  //
  let currentMenu = null
  const menus = []
  let items: any = []
  for (const element of anchors) {
    const { tag } = element
    if (tag == 'h1') {
      items = []
      currentMenu = { ...element, items }
      menus.push(currentMenu)
    } else if (!currentMenu && tag == 'h2') {
      // See PFDA-2448 - if h2 tags appear before any h1 tag, also add them to the outline
      menus.push({ ...element, items: []})
    } else {
      items.push(element)
    }
  }

  return (
    <StyledUserContentOutline>
      {menus.map((menu, index) => {
        if (menu.tag === 'h2') {
          return (
            <OutlineItemH2 key={index}>
              <HashLink smooth to={`#${menu.anchorId}`}>
                {menu.content}
              </HashLink>
            </OutlineItemH2>
          )
        }
        return (
          <CollapsibleMenu
            title={menu.content}
            titleAnchor={`#${menu.anchorId}`}
            key={index}
          >
            {menu.items.map((item: any, index: number) => (
              <OutlineItemH2 key={index}>
                <HashLink smooth to={`#${item.anchorId}`}>
                  {item.content}
                </HashLink>
              </OutlineItemH2>
            ))}
          </CollapsibleMenu>
        )
      })}
    </StyledUserContentOutline>
  )
}

export type { IOutlineAnchor }
