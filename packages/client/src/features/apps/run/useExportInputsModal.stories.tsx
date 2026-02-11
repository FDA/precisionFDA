import { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { mockExportApp } from '../../../mocks/handlers/apps.handlers'
import { mockExportInputData } from '../../../mocks/handlers/files.handlers'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { useExportInputsModal } from './useExportInputsModal'

const meta: Meta = {
  title: 'Modals/Apps',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  showCopyButton: boolean
}
type Story = StoryObj<Props>

const ExportInputsModalWrapper = ({ showCopyButton }: Props) => {
  const { modalComp, openModal } = useExportInputsModal({
    showCopyButton,
    app: mockExportApp,
  })

  useEffect(() => {
    openModal(mockExportInputData, ['file-FGpkXb80xbPGbqJX4xjjGQ47'])
  }, [])

  return modalComp
}

export const ExportInputsModal: Story = {
  render: ({ showCopyButton = true }) => {
    return <ExportInputsModalWrapper showCopyButton={showCopyButton} />
  },
  argTypes: {
    showCopyButton: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
