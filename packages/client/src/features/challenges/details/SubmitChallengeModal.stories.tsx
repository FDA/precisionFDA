import type { Meta, StoryObj } from '@storybook/react-vite'
import { HttpResponse, http } from 'msw'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { InputSpec } from '@/features/apps/apps.types'
import type { IFile } from '@/features/files/files.types'
import { StorybookProviders } from '@/stories/StorybookProviders'
import type { Challenge } from '../types'
import { useSubmitChallengeModal } from './SubmitChallengeModal'

const exampleChallenge = {
  id: 42,
  name: 'Precision Oncology Challenge',
  description: 'Submit a scoring-app entry against the challenge dataset.',
  meta: '',
  startAt: new Date('2026-01-01'),
  endAt: new Date('2026-06-30'),
  createdAt: new Date('2025-12-01'),
  updatedAt: new Date('2025-12-15'),
  status: 'open',
  scope: 'public',
  appUid: 'app-challenge-scoring-1',
  spaceId: '7',
  cardImageUrl: '',
  preRegistrationUrl: '',
  follows: true,
  canEdit: false,
  isSpaceMember: true,
  infoContent: '',
  infoEditorState: '',
  preRegistrationContent: '',
  preRegistrationEditorState: '',
  resultsContent: '',
  resultsEditorState: '',
} satisfies Challenge

const exampleInputSpecs: InputSpec[] = [
  {
    class: 'string',
    name: 'cohort_label',
    label: 'Cohort label',
    help: 'Short label for this submission cohort.',
    optional: false,
    default: null,
    choices: null,
  },
  {
    class: 'file',
    name: 'predictions',
    label: 'Predictions file',
    help: 'Upload a VCF or TSV of predictions. Click Select file to exercise nested dialog stacking.',
    optional: false,
    default: null,
    choices: null,
  },
  {
    class: 'array:file',
    name: 'supporting_files',
    label: 'Supporting files',
    help: 'Optional additional inputs.',
    optional: true,
    default: null,
    choices: null,
  },
]

const exampleSelectFiles: IFile[] = Array.from({ length: 8 }, (_, index) => {
  const id = index + 1
  return {
    id,
    uid: `file-challenge-select-${id}`,
    name: `challenge-entry-${String(id).padStart(2, '0')}-${id % 2 === 0 ? 'predictions.vcf' : 'reads.fastq.gz'}`,
    type: 'UserFile',
    stiType: 'UserFile',
    locked: false,
    resource: false,
    locking: false,
    state: 'closed',
    location: 'Private',
    addedBy: 'Storybook User',
    createdAt: '2026-01-15',
    featured: false,
    scope: 'private',
    spaceId: null,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    fileSize: '1.2 MB',
    createdAtDateTime: '2026-01-15T10:00:00Z',
    description: null,
    show_license_pending: false,
    folderId: null,
  }
}) satisfies IFile[]

const submitChallengeHandlers = [
  http.get('/api/v2/challenges/:challengeId/app', () =>
    HttpResponse.json({
      inputSpec: exampleInputSpecs,
    }),
  ),
  http.post('/challenges/:challengeId/submissions/create', async () => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return HttpResponse.json({ ok: true })
  }),
  http.get('/api/v2/files', ({ request }) => {
    const url = new URL(request.url)
    const uidParam = url.searchParams.get('uids')
    const requestedUids = uidParam?.split(',').filter(Boolean)
    const files = requestedUids?.length
      ? exampleSelectFiles.filter(file => requestedUids.includes(file.uid))
      : exampleSelectFiles

    return HttpResponse.json({
      data: files,
      meta: { page: 1, pageSize: 20, total: files.length, totalPages: 1 },
    })
  }),
  http.get('/api/spaces/', () =>
    HttpResponse.json({
      data: [],
      meta: { page: 1, pageSize: 1000, total: 0, totalPages: 1 },
    }),
  ),
]

const meta: Meta = {
  title: 'Modals/Challenge',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Submit Challenge Entry dialog. Open a file input to verify the nested select-file dialog stacks above this modal.',
      },
    },
    msw: {
      handlers: submitChallengeHandlers,
    },
  },
}

type Story = StoryObj

const SubmitChallengeModalWrapper = ({ challenge = exampleChallenge }: { challenge?: Challenge }) => {
  const { modalComp, openModal } = useSubmitChallengeModal(challenge)

  useEffect(() => {
    openModal()
  }, [])

  return (
    <div className="flex flex-col items-start gap-3 p-4">
      <Button type="button" onClick={openModal}>
        Open Submit Challenge Entry
      </Button>
      <p className="max-w-md text-sm text-muted-foreground">
        Use <span className="font-medium text-foreground">Select file...</span> on Predictions file to open the nested
        file dialog and confirm it appears above this modal.
      </p>
      {modalComp}
    </div>
  )
}

export const SubmitChallengeModal: Story = {
  render: () => <SubmitChallengeModalWrapper />,
}

export default meta
