import { Meta, StoryObj } from '@storybook/react-webpack5'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { DialogType } from '../../home/types'
import { IApp } from '../apps.types'
import { useSelectAppModal } from './useSelectAppModal'

const meta: Meta = {
  title: 'Modals/Apps',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  dialogType: DialogType
}
type Story = StoryObj<Props>

const SelectAppModalWrapper = ({ dialogType }: Props) => {
  const { modalComp, setShowModal } = useSelectAppModal(
    'Select App',
    dialogType,
    (selectedApps: IApp[]) => {
      console.log('Selected apps:', selectedApps)
      alert(`Selected ${selectedApps.length} app(s)`)
    },
    'Choose an app for your analysis',
    ['private', 'public'],
  )

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const SelectAppModal: Story = {
  render: ({ dialogType = 'checkbox' }) => {
    return <SelectAppModalWrapper dialogType={dialogType} />
  },
  argTypes: {
    dialogType: {
      options: ['checkbox', 'radio'] as DialogType[],
      control: { type: 'radio' },
    },
  },
}

export default meta
