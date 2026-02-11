import { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { WithListData } from '../../stories/helpers'
import { fetchApps, FetchAppsQuery } from '../apps/apps.api'
import { IApp } from '../apps/apps.types'
import { fetchFiles, FetchFilesQuery } from '../files/files.api'
import { IFile, IFolder } from '../files/files.types'
import { APIResource, PropertiesResource, ServerScope } from '../home/types'
import { useEditPropertiesModal } from './useEditPropertiesModal'

const meta: Meta = {
  title: 'Modals/Common',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type EditableResource = {
  id: number
  name: string
  properties: { [key: string]: string }
  scope: ServerScope
  featured: boolean
}

type Props = {
  data: EditableResource
  type: PropertiesResource
}

type Story = StoryObj<Props>

const EditPropertiesModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useEditPropertiesModal({
    selected: [props.data],
    type: props.type,
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])
  return modalComp
}

const convertToEditableResource = (item: IFile | IFolder | IApp): EditableResource => ({
  id: item.id,
  name: item.name,
  properties: item.properties,
  scope: item.scope,
  featured: item.featured,
})

const getAPIResourceFromPropertiesResource = (type: PropertiesResource): APIResource => {
  switch (type) {
    case 'node':
      return 'files'
    case 'appSeries':
      return 'apps'
    default:
      return 'files' // fallback
  }
}

export const EditPropertiesModal: Story = {
  render: ({ type = 'node' }) => {
    const apiResource = getAPIResourceFromPropertiesResource(type)
    
    if (apiResource === 'files') {
      return (
        <WithListData resource={apiResource} fetchList={fetchFiles}>
          {({ data }) => {
            if (!data) {
              return <div>No data available</div>
            }
            
            const filesData = data as FetchFilesQuery
            const items = filesData.files || []
            const firstItem = items[0]
            
            if (!firstItem) {
              return <div>No data available</div>
            }
            
            const editableData = convertToEditableResource(firstItem)
            return <EditPropertiesModalWrapper data={editableData} type={type} />
          }}
        </WithListData>
      )
    } else {
      return (
        <WithListData resource={apiResource} fetchList={fetchApps}>
          {({ data }) => {
            if (!data) {
              return <div>No data available</div>
            }
            
            const appsData = data as FetchAppsQuery
            const items = appsData.apps || []
            const firstItem = items[0]
            
            if (!firstItem) {
              return <div>No data available</div>
            }
            
            const editableData = convertToEditableResource(firstItem)
            return <EditPropertiesModalWrapper data={editableData} type={type} />
          }}
        </WithListData>
      )
    }
  },
  argTypes: {
    type: {
      options: ['node', 'appSeries'] as PropertiesResource[],
      control: { type: 'radio' },
    },
  },
}

export default meta
