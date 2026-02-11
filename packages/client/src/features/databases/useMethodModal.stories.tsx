import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { MethodType } from './databases.types'
import { useMethodModal } from './useMethodModal'
import { mockDatabases, dbclusterMocks } from '../../mocks/handlers/databases.handlers'

const meta: Meta = {
  title: 'Modals/Databases',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
  parameters: {
    msw: {
      handlers: dbclusterMocks,
    },
  },
}

type Props = {
  method: MethodType
  multipleItems: boolean
}
type Story = StoryObj<Props>

const MethodModalWrapper = ({ method, multipleItems }: Props) => {
  const selected = multipleItems ? mockDatabases : [mockDatabases[0]]
  
  const { modalComp, setShowModal } = useMethodModal({
    method,
    selected,
    onSuccess: () => console.log(`Database ${method} completed`),
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const DatabaseMethodModal: Story = {
  render: ({ method = 'start', multipleItems = false }) => {
    return <MethodModalWrapper method={method} multipleItems={multipleItems} />
  },
  argTypes: {
    method: {
      options: ['start', 'stop', 'terminate'] as MethodType[],
      control: { type: 'radio' },
    },
    multipleItems: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
