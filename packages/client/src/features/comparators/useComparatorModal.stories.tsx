import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useComparatorModal } from './useComparatorModal'
import { mockExportApp } from '../../mocks/handlers/apps.handlers'

const meta: Meta = {
  title: 'Modals/Comparators',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type ComparatorActionTypes = 'remove_from_comparators' | 'add_to_comparators' | 'set_app'

type Props = {
  actionType: ComparatorActionTypes
}
type Story = StoryObj<Props>

const ComparatorModalWrapper = ({ actionType }: Props) => {
  const selected = mockExportApp

  const { modalComp, setShowModal } = useComparatorModal({
    actionType,
    selected,
    onSuccess: () => {
      console.log('Success callback triggered')
    },
  })

  useEffect(() => {
    setShowModal(true, actionType)
  }, [setShowModal, actionType])

  return modalComp
}

export const AddToComparatorsModal: Story = {
  render: () => {
    return <ComparatorModalWrapper actionType="add_to_comparators" />
  },
}

export const RemoveFromComparatorsModal: Story = {
  render: () => {
    return <ComparatorModalWrapper actionType="remove_from_comparators" />
  },
}

export const SetAsDefaultComparatorModal: Story = {
  render: () => {
    return <ComparatorModalWrapper actionType="set_app" />
  },
}

export const ComparatorModal: Story = {
  render: ({ actionType = 'add_to_comparators' }) => {
    return <ComparatorModalWrapper actionType={actionType} />
  },
  argTypes: {
    actionType: {
      options: ['add_to_comparators', 'remove_from_comparators', 'set_app'] as ComparatorActionTypes[],
      control: { type: 'radio' },
    },
  },
}

export default meta
