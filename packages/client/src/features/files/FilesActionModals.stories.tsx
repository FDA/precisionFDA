import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { WithListData } from '../../stories/helpers'
import { ServerScope } from '../home/types'
import { useAttachLicensesModal } from '../licenses/useAttachLicensesModal'
import { useAddFolderModal } from './actionModals/useAddFolderModal'
import { useCopyFilesModal } from './actionModals/useCopyFilesModal'
import { useCopyFilesToSpaceModal } from './actionModals/useCopyFilesToSpaceModal'
import { useDownloadFileModal } from './actionModals/useDownloadFileModal'
import { useEditFileModal } from './actionModals/useEditFileModal'
import { useFileUploadModal } from './actionModals/useFileUploadModal'
import { useOpenFileModal } from './actionModals/useOpenFileModal'
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
    homeScope: undefined,
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
  const { modalComp, setShowModal } = useFileUploadModal({
    homeScope: undefined,
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

const DownloadFileModalWrapper = ({ data }: any) => {
  const { modalComp, setShowModal } = useDownloadFileModal(data?.files, 'private')
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}
export const DownloadFileModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <DownloadFileModalWrapper data={data} />}
    </WithListData>
  ),
}

const AttachLicensesModalWrapper = ({ data }: any) => {
  const { modalComp, setShowModal } = useAttachLicensesModal<IFile>({
    selected: data?.files[0],
    resource: 'files',
    onSuccess: () => {},
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}
export const AttachLicensesModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <AttachLicensesModalWrapper data={data} />}
    </WithListData>
  ),
}

const EditFileModalWrapper = (props: any) => {
  const { modalComp, setShowModal } = useEditFileModal(props.data.files[1])
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const EditFileModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <EditFileModalWrapper data={data} />}
    </WithListData>
  ),
}

const OpenFilesModalWrapper = (props: any) => {
  const { modalComp, setShowModal } = useOpenFileModal(props.data.files)
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const OpenFilesModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <OpenFilesModalWrapper data={data} />}
    </WithListData>
  ),
}

const ValidateCopiedFilesModalWrapper = ({ ignoreScope, ids }: { ignoreScope: ServerScope[]; ids: number[] }) => {
  const { modalComp, setShowModal } = useCopyFilesModal({ ignoreScope, ids })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const ValidateCopiedFilesModal: Story = {
  render: () => <ValidateCopiedFilesModalWrapper ignoreScope={[]} ids={[1, 2]} />,
}

export default meta
