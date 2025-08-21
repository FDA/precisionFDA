import React from 'react'
import { Meta, StoryObj } from '@storybook/react-webpack5'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { ChallengeMyEntriesTable, ChallengeMyEntriesTableProps } from './ChallengeMyEntriesTable'
import { challengeHandlers } from '../../../mocks/handlers/challenges.handlers'
import { authHandlers } from '../../../mocks/handlers/auth.handlers'
import { IUser } from '../../../types/user'


// Mock user for the stories
const mockUser: IUser = {
  id: 1,
  name: 'Test User',
  fullName: 'Test User',
  org: 'Test Organization',
  url: '/users/testuser',
  isAccepted: true,
  dxuser: 'testuser',
  admin: false,
  can_access_notification_preference: true,
  can_administer_site: false,
  review_space_admin: false,
  can_create_challenges: false,
  allowed_to_publish: true,
  can_create_data_portals: false,
  can_see_spaces: true,
  counters: {
    files: 15,
    folders: 5,
    apps: 3,
    workflows: 2,
    jobs: 8,
    assets: 1,
    notes: 4,
  },
  resources: [],
  email: 'testuser@example.com',
  first_name: 'Test',
  full_name: 'Test User',
  job_limit: 100,
  last_name: 'User',
  handle: 'testuser',
  session_id: 'test-session-id',
}

const meta: Meta<ChallengeMyEntriesTableProps> = {
  title: 'Features/Challenges/ChallengeMyEntriesTable',
  component: ChallengeMyEntriesTable,
  decorators: [
    (Story) => (
      <StorybookProviders>
        <div style={{ padding: '20px' }}>
          <Story />
        </div>
      </StorybookProviders>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [...challengeHandlers, ...authHandlers],
    },
  },
  argTypes: {
    challengeId: {
      control: { type: 'text' },
      description: 'The ID of the challenge to fetch entries for',
    },
    isSpaceMember: {
      control: { type: 'boolean' },
      description: 'Whether the user is a space member (affects permissions)',
    },
  },
}

type Story = StoryObj<ChallengeMyEntriesTableProps>

export const Default: Story = {
  args: {
    challengeId: '1',
    isSpaceMember: false,
    user: mockUser,
  },
}

export const EmptyState: Story = {
  args: {
    challengeId: 'empty',
    isSpaceMember: false,
    user: mockUser,
  },
}

export const NotLoggedIn: Story = {
  args: {
    challengeId: '1',
    isSpaceMember: false,
    user: undefined,
  },
}

export default meta
