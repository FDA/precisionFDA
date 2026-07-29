import type { Meta, StoryObj } from '@storybook/react-vite'
import { HttpResponse, http } from 'msw'
import { useEffect } from 'react'
import { mockSelectApps } from '../../mocks/handlers/apps.handlers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import type { IChallenge } from '../../types/challenge'
import type { AppFetchResponse } from './apps.api'
import type { IApp } from './apps.types'
import { useAttachToChallengeModal } from './useAttachToChallengeModal'

const exampleApp = mockSelectApps[0] as IApp

const exampleChallenges = [
  {
    id: 101,
    name: 'Precision Oncology Challenge',
    appOwnerId: 1,
    appId: exampleApp.id,
    description: 'Benchmark variant interpretation workflows across curated oncology cases.',
    meta: { regions: { intro: '', results: '', 'results-details': '' } },
    startAt: new Date('2026-01-01'),
    endAt: new Date('2026-03-31'),
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-15'),
    status: 'open',
    automated: false,
    cardImageUrl: '',
    cardImageId: '',
    preRegistrationUrl: '',
    specifiedOrder: 1,
    spaceId: 1,
    isFollowed: true,
    canEdit: false,
    links: {},
    timeStatus: 'current',
  },
  {
    id: 102,
    name: 'Genome Assembly Bakeoff',
    appOwnerId: 1,
    appId: exampleApp.id,
    description: 'Compare assembly pipelines on long-read microbial datasets.',
    meta: { regions: { intro: '', results: '', 'results-details': '' } },
    startAt: new Date('2026-04-01'),
    endAt: new Date('2026-06-30'),
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-15'),
    status: 'pre-registration',
    automated: false,
    cardImageUrl: '',
    cardImageId: '',
    preRegistrationUrl: '',
    specifiedOrder: 2,
    spaceId: 2,
    isFollowed: false,
    canEdit: false,
    links: {},
    timeStatus: 'upcoming',
  },
  {
    id: 103,
    name: 'Rare Disease Diagnostic Sprint',
    appOwnerId: 1,
    appId: exampleApp.id,
    description: 'Evaluate phenotype-driven prioritization workflows.',
    meta: { regions: { intro: '', results: '', 'results-details': '' } },
    startAt: new Date('2025-07-01'),
    endAt: new Date('2025-09-30'),
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-10-15'),
    status: 'result_announced',
    automated: false,
    cardImageUrl: '',
    cardImageId: '',
    preRegistrationUrl: '',
    specifiedOrder: 3,
    spaceId: 3,
    isFollowed: false,
    canEdit: false,
    links: {},
    timeStatus: 'ended',
  },
] satisfies IChallenge[]

const exampleAppResponse: AppFetchResponse = {
  app: exampleApp,
  meta: {
    accessibleJobsCount: 0,
    spec: { inputSpec: [], outputSpec: [], internetAccess: false, instanceType: 'baseline-8' },
    internal: { code: '', packages: [] },
    release: '',
    assets: [],
    revisions: [],
    comparator: false,
    defaultComparator: false,
    assignedChallenges: [],
    challenges: exampleChallenges,
  },
}

const meta: Meta = {
  title: 'Modals/Apps',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v2/apps/:uid', () => HttpResponse.json(exampleAppResponse)),
        http.post('/api/assign_app', () => HttpResponse.json({ message: { type: 'success', text: 'App assigned' } })),
      ],
    },
  },
}
type Props = {
  data: IApp
}
type Story = StoryObj<Props>

const AttachToChallengeModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useAttachToChallengeModal({
    resource: 'apps',
    selected: props.data,
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])
  return modalComp
}

export const AttachToChallengeModal: Story = {
  render: () => <AttachToChallengeModalWrapper data={exampleApp} />,
}

export default meta
