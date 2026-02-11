import { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { DialogType } from '../../home/types'
import { IAsset } from '../assets.types'
import { useSelectAssetModal } from './useSelectAssetModal'

const meta: Meta = {
  title: 'Modals/Assets',
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

const SelectAssetModalWrapper = ({ dialogType, showSubtitle }: Props) => {
  const { modalComp, setShowModal } = useSelectAssetModal(
    'Select Asset',
    dialogType,
    (selectedAssets: IAsset[]) => {
      console.log('Selected assets:', selectedAssets)
      alert(`Selected ${selectedAssets.length} asset(s): ${selectedAssets.map(a => a.title).join(', ')}`)
    },
    showSubtitle ? 'Choose assets for your analysis workflow' : undefined,
    ['private', 'public', 'space-1'],
  )

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const SelectAssetModal: Story = {
  render: ({ dialogType = 'checkbox', showSubtitle = true }) => {
    return <SelectAssetModalWrapper dialogType={dialogType} showSubtitle={showSubtitle} />
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
