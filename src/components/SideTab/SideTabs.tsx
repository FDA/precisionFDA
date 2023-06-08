import React, { ReactElement, useState } from 'react'
import styled from 'styled-components'
import { SideTabTitle } from './SideTabTitle'

const StyledTabs = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 16px;
`
const StyledTitleWrapper = styled.div`
  display: flex;
  width: 300px;
  flex-direction: column;
`
const StyledBody = styled.div``

type Props = {
  children: ReactElement[]
}

export const SideTabs: React.FC<Props> = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState(0)

  return (
    <StyledTabs>
      <StyledTitleWrapper>
        {children.map((item, index) => (
          <SideTabTitle
            key={item.key}
            title={item.props.title}
            index={index}
            setSelectedTab={setSelectedTab}
            active={selectedTab === index}
          />
        ))}
      </StyledTitleWrapper>
      <StyledBody>
        {children[selectedTab]}
      </StyledBody>
    </StyledTabs>
  )
}