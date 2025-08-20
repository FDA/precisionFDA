import React, { ReactElement, useState } from 'react'
import { TabTitle } from './TabTitle'

type Props = {
  children: ReactElement[]
  nonSelected?: boolean
}

export const Tabs: React.FC<Props> = ({ children, nonSelected }) => {
  const [selectedTab, setSelectedTab] = useState(nonSelected ? 1 : 0)

  return (
    <div>
      {children.map((item, index) => (
        <TabTitle
          key={item.key}
          title={(item.props as {title: string}).title}
          index={index}
          setSelectedTab={setSelectedTab}
          active={selectedTab === index}
        />
      ))}
      {children[selectedTab]}
    </div>
  )
}
