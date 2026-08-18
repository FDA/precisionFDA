import type { Meta, StoryObj } from '@storybook/react-vite'
import { useOpenModalInStory } from '@/stories/useOpenModalInStory'
import { mockTestSpace, mockUnlockedTestSpace } from '../../mocks/handlers/spaces.handlers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useUnlockSpaceModal } from './useUnlockSpaceModal'

const meta: Meta = {
  title: 'Modals/Spaces/Lock or Unlock Space',
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
    onSuccess: isLocked => console.log('Space lock state changed:', isLocked),
  })

  useOpenModalInStory(setShowModal)

  return modalComp
}

export const Unlock: Story = {
  args: { spaceState: 'locked' },
  render: args => <UnlockSpaceModalWrapper {...args} />,
}

export const Lock: Story = {
  args: { spaceState: 'unlocked' },
  render: args => <UnlockSpaceModalWrapper {...args} />,
}

export default meta
