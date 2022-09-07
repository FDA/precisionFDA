import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import Table from '../components/Table/Table'
import { Router } from 'react-router'
import history from '../utils/history'
import { Provider } from 'react-redux'
import store from '../store'
import { LoaderWrapper } from '../views/components/LoaderWrapper/LoaderWrapper'
import GlobalStyle from '../styles/global'
import { useStroybookColumns } from './useStorybookColumns'
import { useStroybookData } from './useStorybookData'

export default {
  title: 'Components/Table',
  component: Table,
} as ComponentMeta<typeof Table>

const Template: ComponentStory<typeof Table> = args => {
  const columns = useStroybookColumns()
  const data = useStroybookData()
  return (
    <Provider store={store}>
      <Router history={history}>
        <>
          <GlobalStyle />
          <LoaderWrapper>
            <Table
              {...args}
              name="storybooks"
              columns={columns}
              data={data}
            />
          </LoaderWrapper>
        </>
      </Router>
    </Provider>
  )
}

export const KitchenSink = Template.bind({})
KitchenSink.args = {
  loading: false,
  isSelectable: true,
  isExpandable: true,
  isFilterable: true,
  isSortable: true,
}
