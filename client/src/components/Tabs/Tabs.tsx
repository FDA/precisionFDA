import React, { ReactElement, useState } from 'react'
import styled from 'styled-components'
import { TabTitle } from './TabTitle'

const StyledTabs = styled.div`
  display: inline-block;
`

type Props = {
  children: ReactElement[]
}

export const Tabs: React.FC<Props> = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState(0)

  return (
    <div>
        {children.map((item, index) => (
          <TabTitle
            key={item.key}
            title={item.props.title}
            index={index}
            setSelectedTab={setSelectedTab}
            active={selectedTab === index}
          />
        ))}
      {children[selectedTab]}
    </div>
  )
}