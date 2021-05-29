import React, { FunctionComponent } from 'react'
import { HashLink } from 'react-router-hash-link'
import styled from 'styled-components'

import { theme } from '../../../../styles/theme'
import CollapsibleMenu from '../../CollapsibleMenu'


const StyledUserContentOutline = styled.div`
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

.outline-item-h2 {
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
}
`

interface IOutlineAnchor {
  tag: string,
  content: string,
  anchorId?: string,
  action?: () => void,
}

interface IUserContentOutline {
  anchors: IOutlineAnchor[],
}

export const UserContentOutline: FunctionComponent<IUserContentOutline> = ({ anchors }) => {
  // Translate the flat list of h1, h2, etc tags into hierarchical menu structure
  // that can be converted to a list of CollapsibleMenu components
  //
  const menus = []
  let items: any = []
  for (const element of anchors) {
    const tag = element['tag'].toLowerCase()
    if (tag == 'h1') {
      items = []
      const currentMenu = { ...element, 'items': items }
      menus.push(currentMenu)
    }
    else {
      items.push(element)
    }
  }

  return (
    <StyledUserContentOutline>
    {menus.map((menu, index) => {
      return <CollapsibleMenu title={menu['content']} titleAnchor={'#'+menu['anchorId']} key={index}>
              { menu['items'].map((item: any, index: number) => {
                return (
                  <div className={ 'outline-item-'+item['tag'].toLowerCase() } key={index} onClick={item['action'] ? item['action'] : null}>
                    <HashLink smooth to={'#'+item['anchorId']}>{item['content']}</HashLink>
                  </div>
                )
              })}
            </CollapsibleMenu>
    })}
    </StyledUserContentOutline>
  )
}

export type {
  IOutlineAnchor,
}
