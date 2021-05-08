import React, { FunctionComponent } from 'react'
import { HashLink } from 'react-router-hash-link'
import styled from 'styled-components'

import CollapsibleMenu from '../../CollapsibleMenu'


const StyledChallengOutline = styled.div`
.outline-item-h1 {
  margin-top: 3px;

  a {
    color: #272727; // $pfda-text-dark-grey
    font-weight: 400;
    font-size: 14px; // $pfda-subheading-text-size;
    margin-top: 12px;

    &:hover {
      color: #646464; // $pfda-text-medium-grey;
    }
  }
}

.outline-item-h2 {
  margin-top: 3px;
  margin-left: 16px;

  a {
    color: #272727; /* $pfda-text-dark-grey */
    font-weight: 400;
    font-size: 14px; // $pfda-subheading-text-size;
    margin-top: 12px;

    &:hover {
      color: #646464; // $pfda-text-medium-grey;
    }
  }
}
`

interface IOutlineAnchor {
  tag: string,
  content: string,
  anchorId: string,
  action: () => void,
}

interface IChallengOutline {
  anchors: IOutlineAnchor[],
}

export const ChallengOutline: FunctionComponent<IChallengOutline> = ({ anchors }) => {
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
    <StyledChallengOutline>
    {menus.map((menu, index) => {
      return <CollapsibleMenu title={menu['content']} key={index}>
              { menu['items'].map((item: any, index: number) => {
                return (
                  <div className={ 'outline-item-'+item['tag'].toLowerCase() } key={index}>
                    <HashLink smooth to={'#'+item['anchorId']}>{item['content']}</HashLink>
                  </div>
                )
              })}
            </CollapsibleMenu>
    })}
    </StyledChallengOutline>
  )
}

export default ChallengOutline
