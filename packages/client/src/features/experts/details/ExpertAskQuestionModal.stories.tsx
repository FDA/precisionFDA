import { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { ExpertAskQuestionModal } from './ExpertAskQuestionModal'

const meta: Meta = {
  title: 'Modals/Experts',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  isLoggedIn: boolean
}
type Story = StoryObj<Props>

const mockUser = {
  full_name: 'Dr. Jane Smith',
  dxuser: 'jsmith',
}

const ExpertAskQuestionModalWrapper = ({ isLoggedIn }: Props) => {
  const [isOpen, setIsOpen] = useState(true)

  const handleHideAction = () => {
    setIsOpen(false)
  }

  const handleAction = (fullName: string, question: string, captcha: string | null) => {
    console.log(`Question submitted by ${fullName}: ${question}`)
    if (captcha) console.log('Captcha provided')
    setIsOpen(false)
  }

  return (
    <ExpertAskQuestionModal
      hideAction={handleHideAction}
      action={handleAction}
      title="Ask Dr. Sarah Johnson a Question"
      user={mockUser}
      isOpen={isOpen}
      isLoggedIn={isLoggedIn}
    />
  )
}

export const ExpertAskQuestionModalStory: Story = {
  render: ({ isLoggedIn = true }) => {
    return <ExpertAskQuestionModalWrapper isLoggedIn={isLoggedIn} />
  },
  argTypes: {
    isLoggedIn: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
