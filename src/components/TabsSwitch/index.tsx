import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import styled from 'styled-components'

export interface ITab {
  header: string,
  tab: JSX.Element,
  hide: boolean
}

const StyledTabs = styled(Tabs)`
  .__tab-list {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    border-bottom: 1px solid #DDDDDD;

    &_tab {
      box-sizing: border-box;
      height: 35px;
      padding: 5px 10px;
      background: #F2F2F2;
      border: 1px solid #DDDDDD;
      border-bottom: none;
      cursor: pointer;
      margin-left: 10px;
      margin-bottom: -1px;
      border-radius: 3px 3px 0 0;
      font-weight: 400;
      color: #272727;
      font-size: 14px;
    }
  }
  .react-tabs__tab--selected {
    background: #fff;
  }
`

export const TabsSwitch = ({ tabsConfig }: { tabsConfig: ITab[]}) => {
  const tabList: JSX.Element[] = []
  const tabPanels: JSX.Element[] = []

  const tabsToShow = tabsConfig.filter(e => !e.hide)

  if (!tabsToShow || !tabsToShow.length) return null

  tabsToShow.forEach(e => {
    tabList.push(
      <Tab key={e.header} className='__tab-list_tab'>
        {e.header}
      </Tab>,
    )

    tabPanels.push(
      <TabPanel key={e.header} className='__tab-panel'>
        {e.tab}
      </TabPanel>,
    )
  })

  return (
    <StyledTabs>
      <TabList className='__tab-list'>
        {tabList}
      </TabList>
      {tabPanels}
    </StyledTabs>
  )
}

