import type { Meta, StoryObj } from '@storybook/react-vite'
import { HttpResponse, http } from 'msw'
import { useEffect } from 'react'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import type { DialogType, ServerScope } from '../../home/types'
import type { IComparison } from '../comparisons.types'
import { useSelectComparisonModal } from './useSelectComparisonModal'

const exampleComparisons: IComparison[] = Array.from({ length: 8 }, (_, index) => {
  const id = index + 1
  const isPublic = id % 3 === 0
  const scope: ServerScope = isPublic ? 'public' : id % 2 === 0 ? 'space-42' : 'private'

  return {
    id,
    uid: `comparison-select-example-${id}`,
    className: 'Comparison',
    scope,
    path: `${scope === 'space-42' ? '/spaces/42' : '/home'}/comparisons/comparison-select-example-${id}`,
    owned: id % 2 === 1,
    editable: true,
    accessible: true,
    file_path: `/cohort-2026/comparisons/run-${String(id).padStart(2, '0')}`,
    parent_folder_name: id % 2 === 0 ? 'variant comparisons' : 'expression comparisons',
    public: isPublic,
    private: !isPublic,
    in_space: scope.startsWith('space-'),
    space_private: scope === 'space-42',
    space_public: false,
    title: `Cohort ${id} ${id % 2 === 0 ? 'variant concordance' : 'RNA expression'} comparison`,
    name: `cohort-${id}-comparison`,
    prefix: `cmp-${id}`,
    description: `Comparison output for sequencing research cohort ${id}`,
    file_paths: [
      `/cohort-2026/comparisons/run-${String(id).padStart(2, '0')}/summary.tsv`,
      `/cohort-2026/comparisons/run-${String(id).padStart(2, '0')}/metrics.json`,
    ],
    user: {
      dxuser: id % 2 === 0 ? 'collaborator' : 'storybook-user',
      full_name: id % 2 === 0 ? 'Collaborating Scientist' : 'Storybook User',
    },
    org: {
      handle: id % 2 === 0 ? 'clinical-genomics' : 'precision-fda',
      name: id % 2 === 0 ? 'Clinical Genomics Lab' : 'PrecisionFDA',
    },
  }
})

const selectComparisonHandlers = [
  http.post('/api/list_comparisons', async ({ request }) => {
    const body = (await request.json()) as { search_string?: string; scopes?: ServerScope[] }
    const search = body.search_string?.toLowerCase() ?? ''
    const scopes = body.scopes ?? []

    const comparisons = exampleComparisons.filter(comparison => {
      const matchesSearch = search
        ? comparison.title.toLowerCase().includes(search) || comparison.name.toLowerCase().includes(search)
        : true
      const matchesScope = scopes.length > 0 ? scopes.includes(comparison.scope) : true

      return matchesSearch && matchesScope
    })

    return HttpResponse.json(comparisons)
  }),
]

const meta: Meta = {
  title: 'Modals/Comparisons',
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
  showSubtitle: boolean
}

type Story = StoryObj<Props>

const SelectComparisonModalWrapper = ({ dialogType, showSubtitle }: Props) => {
  const { modalComp, setShowModal } = useSelectComparisonModal(
    'Select Comparison',
    dialogType,
    (selectedComparisons: IComparison[]) => {
      console.log('Selected comparisons:', selectedComparisons)
    },
    showSubtitle ? 'Choose comparisons to attach to your analysis workflow' : undefined,
    ['private', 'public', 'space-42'],
  )

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const SelectComparisonModal: Story = {
  parameters: {
    msw: {
      handlers: selectComparisonHandlers,
    },
  },
  render: ({ dialogType = 'checkbox', showSubtitle = true }) => {
    return <SelectComparisonModalWrapper dialogType={dialogType} showSubtitle={showSubtitle} />
  },
  argTypes: {
    dialogType: {
      options: ['checkbox', 'radio'] as DialogType[],
      control: { type: 'radio' },
    },
    showSubtitle: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
