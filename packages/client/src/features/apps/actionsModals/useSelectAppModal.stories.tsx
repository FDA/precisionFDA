import type { Meta, StoryObj } from '@storybook/react-vite'
import { HttpResponse, http } from 'msw'
import { useEffect } from 'react'
import { mockSelectApps } from '../../../mocks/handlers/apps.handlers'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import type { DialogType } from '../../home/types'
import type { IApp } from '../apps.types'
import { useSelectAppModal } from './useSelectAppModal'

const longSelectAppList = Array.from({ length: 18 }, (_, index) => {
  const app = mockSelectApps[index % mockSelectApps.length]
  const appNumber = index + 1

  return {
    ...app,
    id: appNumber,
    uid: `${app.uid}-${appNumber}`,
    dxid: `${app.dxid}-${appNumber}`,
    name: `${app.name}-${appNumber}`,
    title: `${app.title} ${appNumber}`,
    org: typeof app.org === 'string' ? { handle: app.org.toLowerCase().replaceAll(' ', '-'), name: app.org } : app.org,
  }
})

const meta: Meta = {
  title: 'Modals/Apps/Select App',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
  parameters: {
    msw: {
      handlers: [http.post('/api/list_apps', () => HttpResponse.json(longSelectAppList))],
    },
  },
}

type Props = {
  dialogType: DialogType
}
type Story = StoryObj<Props>

const SelectAppModalWrapper = ({ dialogType }: Props) => {
  const { modalComp, setShowModal } = useSelectAppModal(
    'Select App',
    dialogType,
    (selectedApps: IApp[]) => {
      console.log('Selected apps:', selectedApps)
      alert(`Selected ${selectedApps.length} app(s)`)
    },
    'Choose an app for your analysis',
    ['private', 'public'],
  )

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const Default: Story = {
  render: ({ dialogType = 'checkbox' }) => {
    return <SelectAppModalWrapper dialogType={dialogType} />
  },
  argTypes: {
    dialogType: {
      options: ['checkbox', 'radio'] as DialogType[],
      control: { type: 'radio' },
    },
  },
}

export default meta
