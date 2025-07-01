import { Meta, StoryObj } from '@storybook/react-webpack5'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useUnlockSpaceModal } from './useUnlockSpaceModal'
import { mockTestSpace, mockUnlockedTestSpace } from '../../mocks/handlers/spaces.handlers'

const meta: Meta = {
  title: 'Modals/Spaces',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  spaceState: 'locked' | 'unlocked'
}
type Story = StoryObj<Props>

const UnlockSpaceModalWrapper = ({ spaceState }: Props) => {
  const space = spaceState === 'locked' ? mockTestSpace : mockUnlockedTestSpace
  
  const { modalComp, setShowModal } = useUnlockSpaceModal({
    space,
    onSuccess: (isLocked) => console.log('Space lock state changed:', isLocked),
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const UnlockSpaceModal: Story = {
  render: ({ spaceState = 'locked' }) => {
    return <UnlockSpaceModalWrapper spaceState={spaceState} />
  },
  argTypes: {
    spaceState: {
      options: ['locked', 'unlocked'],
      control: { type: 'radio' },
    },
  },
}

export default meta
