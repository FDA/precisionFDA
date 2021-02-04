import React from 'react'
import PropTypes from 'prop-types'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import './style.sass'


const TabsSwitch = ({ tabsConfig }) => {
  const tabList = []
  const tabPanels = []

  const tabsToShow = tabsConfig.filter(e => !e.hide)

  if (!tabsToShow || !tabsToShow.length) return null

  tabsToShow.forEach(e => {
    tabList.push(
      <Tab key={e.header} className='tabs-switch__tab-list_tab'>
        {e.header}
      </Tab>,
    )

    tabPanels.push(
      <TabPanel key={e.header} className='tabs-switch__tab-panel'>
        {e.tab}
      </TabPanel>,
    )
  })

  return (
    <Tabs className='tabs-switch__tabs-container'>
      <TabList className='tabs-switch__tab-list'>
        {tabList}
      </TabList>
      {tabPanels}
    </Tabs>
  )
}

TabsSwitch.propTypes = {
  tabsConfig: PropTypes.arrayOf(PropTypes.shape({
    header: PropTypes.string,
    tab: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element,
    ]),
    hide: PropTypes.bool,
  })),
}

TabsSwitch.defaultProps = {
  tabsConfig: [],
}

export default TabsSwitch
