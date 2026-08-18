import type { Meta, StoryObj } from '@storybook/react-vite'
import { StorybookProviders } from '@/stories/StorybookProviders'
import { useOpenModalInStory } from '@/stories/useOpenModalInStory'
import { useAddMembersModal } from './useAddMembersModal'

const meta: Meta = {
  title: 'Modals/Spaces/Members/Add Members',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  spaceType: 'verification' | 'groups' | 'review'
}

type Story = StoryObj<Props>

const AddMembersModalHarness = ({ spaceType }: Props) => {
  const spaceId =
    spaceType === 'verification'
      ? 'space-verification-123'
      : spaceType === 'review'
        ? 'space-review-456'
        : 'space-groups-789'

  const { modalComp, setShowModal } = useAddMembersModal({ spaceId })

  useOpenModalInStory(setShowModal)

  return modalComp
}

export const Default: Story = {
  render: ({ spaceType = 'verification' }) => <AddMembersModalHarness spaceType={spaceType} />,
  argTypes: {
    spaceType: {
      options: ['verification', 'groups', 'review'],
      control: { type: 'radio' },
    },
  },
}

export default meta
