import type { Meta, StoryObj } from '@storybook/react-vite'
import { HttpResponse, http } from 'msw'
import { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import type { IFile } from '../files/files.types'
import type { ISpaceReport, SpaceReportFormat, SpaceReportState } from './space-report.types'
import { useDeleteSpaceReportModal } from './useDeleteSpaceReportModal'

const meta: Meta = {
  title: 'Modals/Space Reports',
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
        http.delete('/api/v2/reports', ({ request }) => {
          const url = new URL(request.url)
          const ids = url.searchParams.getAll('id').map(Number)

          return HttpResponse.json(ids)
        }),
      ],
    },
  },
}

type Props = {
  multipleItems: boolean
}

type Story = StoryObj<Props>

const makeReportFile = (id: number): IFile =>
  ({
    id,
    uid: `file-space-report-example-${id}`,
    name: `cohort-analysis-space-report-${String(id).padStart(2, '0')}.html`,
    type: 'file',
    location: 'Private',
    state: 'closed',
    locked: false,
    scope: 'private',
    createdAt: '2026-06-24T10:00:00Z',
    createdAtDateTime: '2026-06-24T10:00:00Z',
    addedBy: 'researcher',
    addedByFullname: 'Research User',
    fileLicense: null,
  }) as IFile

const exampleReports: ISpaceReport<SpaceReportFormat>[] = Array.from({ length: 5 }, (_, index) => {
  const id = index + 1
  const state: SpaceReportState = index % 2 === 0 ? 'DONE' : 'ERROR'

  return {
    id,
    resultFile: makeReportFile(id),
    state,
    createdAt: new Date(`2026-06-${String(18 + id).padStart(2, '0')}T14:30:00Z`),
    format: 'HTML',
    options: undefined as never,
  }
})

const DeleteSpaceReportModalWrapper = ({ multipleItems }: Props) => {
  const selected = multipleItems ? exampleReports : [exampleReports[0]]
  const { modalComp, setShowModal } = useDeleteSpaceReportModal({
    selected,
    scope: 'space-42',
    onClose: () => console.log('Space report delete modal closed'),
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const DeleteSpaceReportModal: Story = {
  render: ({ multipleItems = true }) => <DeleteSpaceReportModalWrapper multipleItems={multipleItems} />,
  argTypes: {
    multipleItems: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
