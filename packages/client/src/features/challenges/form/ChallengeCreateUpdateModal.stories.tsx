import { Meta, StoryObj } from '@storybook/react-webpack5'
import React from 'react'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { ChallengeCreateUpdateModal } from './ChallengeCreateUpdateModal'

const meta: Meta = {
  title: 'Modals/Challenge',
}

type Story = StoryObj<typeof ChallengeCreateUpdateModal>

export const CreateUpdateModal: Story = {
  parameters: {
    isEditMode: true,
    isSaving: true,
  },
  render: args => (
    <StorybookProviders>
      <ChallengeCreateUpdateModal {...args} isSaving />
    </StorybookProviders>
  ),
}

export default meta
