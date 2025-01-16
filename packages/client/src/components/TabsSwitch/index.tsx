import React, { useState } from 'react'
import styled from 'styled-components'

export interface ITab {
  header: string
  tab: JSX.Element
  hide: boolean
}

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const TabList = styled.div`
  display: flex;
  list-style-type: none;
  margin: 0;
  padding: 0;
  border-bottom: 1px solid var(--c-layout-border);
`

const TabItem = styled.button<{ isSelected: boolean }>`
  box-sizing: border-box;
  height: 35px;
  padding: 5px 10px;
  background: ${({ isSelected }) => (isSelected ? 'var(--background)' : 'transparent')};
  border: 1px solid ${({ isSelected }) => (isSelected ? 'var(--c-layout-border)' : 'transparent')};
  border-bottom: ${({ isSelected }) => (isSelected ? 'none' : '1px solid var(--c-layout-border)')};
  cursor: pointer;
  margin-left: 10px;
  margin-bottom: -1px;
  border-radius: 3px 3px 0 0;
  font-weight: 400;
  color: ${({ isSelected }) => (isSelected ? 'var(--base)' : '--c-text-300')};
  font-size: 14px;
`
export const TabListRight = styled.div`
  align-self: flex-end;
  flex: 1;
  display: flex;
  justify-content: flex-end;
`
export const TabPanel = styled.div`
`

export const TabsSwitch = ({ tabsConfig, tabListRight }: { tabsConfig: ITab[]; tabListRight?: React.ReactNode }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const tabsToShow = tabsConfig.filter(tab => !tab.hide)

  if (!tabsToShow.length) return null

  return (
    <TabContainer>
      <TabList>
        {tabsToShow.map((tab, index) => (
          <TabItem type='button' key={tab.header} isSelected={selectedIndex === index} onClick={() => setSelectedIndex(index)}>
            {tab.header}
          </TabItem>
        ))}
        {tabListRight}
      </TabList>
      {tabsToShow.map((tab, index) => (
        <TabPanel key={tab.header} style={{ display: selectedIndex === index ? 'block' : 'none' }}>
          {tab.tab}
        </TabPanel>
      ))}
    </TabContainer>
  )
}
