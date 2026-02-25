import React, { useEffect } from 'react'
import { Meta, StoryObj } from '@storybook/react-vite'
import { WithListData } from '../../stories/helpers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { ServerScope } from '../home/types'
import { useAddFolderModal } from './actionModals/useAddFolderModal'
import { useConfirmModal } from './actionModals/useConfirmModal'
import { useCopyFilesModal } from './actionModals/useCopyFilesModal'
import { useCopyFilesToSpaceModal } from './actionModals/useCopyFilesToSpaceModal'
import { useDeleteFileModal } from './actionModals/useDeleteFileModal'
import { useDnDMoveFileModal } from './actionModals/useDnDMoveFileModal'
import { useDownloadFileModal } from './actionModals/useDownloadFileModal'
import { useEditFileModal } from './actionModals/useEditFileModal'
import { useEditFolderModal } from './actionModals/useEditFolderModal'
import { useFileUploadModalContext } from './actionModals/useFileUploadModal'
import { useLockUnlockFileModal } from './actionModals/useLockUnlockFileModal'
import { useOpenFileModal } from './actionModals/useOpenFileModal'
import { useOptionAddFileModal } from './actionModals/useOptionAddFileModal'
import { useSelectFileModal } from './actionModals/useSelectFileModal'
import { useSelectFolderModal } from './actionModals/useSelectFolderModal'
import { fetchFiles } from './files.api'
import { IFile } from './files.types'

const meta: Meta = {
  title: 'Modals/Files',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  data: { id: string }[]
}
type Story = StoryObj<Props>

const AddFolderModalWrapper = () => {
  const { modalComp, setShowModal } = useAddFolderModal({
    folderId: '1',
    spaceId: '1',
    isAllowed: true,
    onViolation: () => {},
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}
export const AddFolderModal: Story = {
  render: () => <AddFolderModalWrapper />,
}

const FileUploadModalWrapper = () => {
  const { openModal } = useFileUploadModalContext()
  useEffect(() => {
    openModal({
      folderId: '1',
      spaceId: '1',
    })
  }, [])
  return <div style={{ padding: 20 }}>The File Upload Modal should be open.</div>
}
export const FileUploadModal: Story = {
  render: () => <FileUploadModalWrapper />,
}

const CopyFilesModalWrapper = () => {
  const { modalComp, setShowModal } = useCopyFilesToSpaceModal({ spaceId: '1' })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}
export const CopyFilesModal: Story = {
  render: () => <CopyFilesModalWrapper />,
}

const DownloadFileModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const { modalComp, setShowModal } = useDownloadFileModal(data?.files || [], 'private')
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}
export const DownloadFileModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <DownloadFileModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const EditFileModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const { modalComp, setShowModal } = useEditFileModal(data?.files?.[1] || data?.files?.[0])
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const EditFileModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <EditFileModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const OpenFilesModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const result = useOpenFileModal(data?.files || [])
  const { modalComp, setShowModal } = result as {
    modalComp: React.ReactElement
    setShowModal: (val: boolean) => void
    isShown: boolean
  }
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const OpenFilesModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <OpenFilesModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const ValidateCopiedFilesModalWrapper = ({ sourceScopes, ids }: { sourceScopes: ServerScope[]; ids: number[] }) => {
  const { modalComp, setShowModal } = useCopyFilesModal({ sourceScopes, selectedIds: ids })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const ValidateCopiedFilesModal: Story = {
  render: () => <ValidateCopiedFilesModalWrapper sourceScopes={['private']} ids={[1, 2]} />,
}

const DeleteFileModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const { modalComp, setShowModal } = useDeleteFileModal({
    selected: data?.files || [],
    onSuccess: () => {},
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const DeleteFileModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <DeleteFileModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const EditFolderModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const folder = data?.files?.find(f => f.type === 'Folder') || data?.files?.[0]
  const { modalComp, setShowModal } = useEditFolderModal(folder)
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const EditFolderModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <EditFolderModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const DnDMoveFileModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const { modalComp, openModal } = useDnDMoveFileModal({
    spaceId: 1,
    selected: data?.files || [],
    onSuccess: () => {},
    onCanceled: () => {},
  })
  useEffect(() => {
    openModal({ id: 1, name: 'Target Folder' })
  }, [])
  return modalComp
}

export const DnDMoveFileModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <DnDMoveFileModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const LockFileModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const { modalComp, setShowModal } = useLockUnlockFileModal({
    selected: data?.files || [],
    onSuccess: () => {},
    scope: 'private',
    type: 'lock',
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const LockFileModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <LockFileModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const UnlockFileModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const { modalComp, setShowModal } = useLockUnlockFileModal({
    selected: data?.files || [],
    onSuccess: () => {},
    scope: 'private',
    type: 'unlock',
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const UnlockFileModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <UnlockFileModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const SelectFileModalWrapper = () => {
  const { modalComp, setShowModal } = useSelectFileModal(
    'Select Files',
    'checkbox',
    files => {
      console.log('Selected files:', files)
    },
    'Choose files from the list below',
    ['private', 'public'],
  )
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const SelectFileModal: Story = {
  render: () => <SelectFileModalWrapper />,
}

const SelectFolderModalWrapper = () => {
  const { modalComp, setShowModal } = useSelectFolderModal({
    headerText: 'Select Folder',
    submitCaption: 'Select',
    scope: 'private',
    onHandleSubmit: (folderId, info) => {
      console.log('Selected folder:', folderId, info)
    },
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const SelectFolderModal: Story = {
  render: () => <SelectFolderModalWrapper />,
}

const ConfirmModalWrapper = () => {
  const { modalComp, setShowModal } = useConfirmModal(
    'Confirm Action',
    'Are you sure you want to proceed with this action?',
    () => {
      console.log('Confirmed!')
    },
  )
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const ConfirmModal: Story = {
  render: () => <ConfirmModalWrapper />,
}

const OptionAddFileModalWrapper = () => {
  const { modalComp, setShowModal } = useOptionAddFileModal({
    openFileUploadModal: () => console.log('Upload modal opened'),
    setShowCopyFilesModal: show => console.log('Copy modal:', show),
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const OptionAddFileModal: Story = {
  render: () => <OptionAddFileModalWrapper />,
}

export default meta
