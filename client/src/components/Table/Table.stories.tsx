import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { useStroybookColumns } from '../../stories/useStorybookColumns'
import { useStroybookData } from '../../stories/useStorybookData'
import Table from './Table'

const meta: Meta = {
  title: 'Components/Table',
  component: Table,
}

const TableWrapper = (args: any) => {
  const columns = useStroybookColumns()
  const data = useStroybookData()
  return <Table {...args} name="storybooks" columns={columns} data={data} />
}

export const KitchenSink: StoryObj = {
  render: args => <TableWrapper {...args} />,
  args: {
    loading: false,
    isSelectable: true,
    isExpandable: true,
    isFilterable: true,
    isSortable: true,
  },
}

export default meta
