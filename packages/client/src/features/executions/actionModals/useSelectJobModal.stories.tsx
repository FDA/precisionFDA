import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { StorybookProviders } from '@/stories/StorybookProviders'
import { selectJobModalHandlers } from '../../../mocks/handlers/executions.handlers'
import type { DialogType } from '../../home/types'
import { useSelectJobModal } from './useSelectJobModal'

const meta: Meta = {
  title: 'Modals/Executions',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  type: DialogType
  privateAndPublicOnly: boolean
}

type Story = StoryObj<Props>

const SelectJobModalWrapper = ({ type, privateAndPublicOnly }: Props) => {
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([])
  const scopes = privateAndPublicOnly ? ['private', 'public'] : undefined
  const { modalComp, setShowModal } = useSelectJobModal(
    'Select Jobs',
    type,
    jobs => setSelectedJobTitles(jobs.map(job => job.title)),
    'Choose DNA sequencing analysis jobs to attach to this research discussion.',
    scopes,
  )

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return (
    <>
      {modalComp}
      {selectedJobTitles.length > 0 && (
        <div className="mt-4 rounded-md border bg-background p-3 text-sm text-foreground">
          Selected: {selectedJobTitles.join(', ')}
        </div>
      )}
    </>
  )
}

export const SelectJobModal: Story = {
  parameters: {
    msw: {
      handlers: selectJobModalHandlers,
    },
  },
  render: ({ type = 'checkbox', privateAndPublicOnly = false }) => (
    <SelectJobModalWrapper type={type} privateAndPublicOnly={privateAndPublicOnly} />
  ),
  argTypes: {
    type: {
      options: ['checkbox', 'radio'],
      control: { type: 'radio' },
    },
    privateAndPublicOnly: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
