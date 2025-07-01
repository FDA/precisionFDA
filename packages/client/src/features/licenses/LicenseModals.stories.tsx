import { Meta, StoryObj } from '@storybook/react-webpack5'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { WithListData } from '../../stories/helpers'
import { useAcceptLicensesModal } from './useAcceptLicensesModal'
import { useAcceptLicenseModal } from './useAcceptLicenseModal'
import { useAttachLicensesModal } from './useAttachLicensesModal'
import { useDetachLicenseModal } from './useDetachLicenseModal'
import { fetchFiles } from '../files/files.api'
import { IFile } from '../files/files.types'
import { FileLicense } from '../assets/assets.types'
import { mockLicenses, mockAcceptedLicenses, licensesMocks } from '../../mocks/handlers/licenses.handlers'

const meta: Meta = {
  title: 'Modals/Licenses',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
  parameters: {
    msw: {
      handlers: licensesMocks,
    },
  },
}

type Props = {
  data: { id: string }[]
}
type Story = StoryObj<Props>

const AcceptLicensesModalWrapper = () => {
  const { modalComp, setLicensesAndShow } = useAcceptLicensesModal()
  useEffect(() => {
    setLicensesAndShow(mockLicenses, mockAcceptedLicenses)
  }, [])
  return modalComp
}

export const AcceptLicensesModal: Story = {
  render: () => <AcceptLicensesModalWrapper />,
}

const AcceptLicenseModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const fileWithLicense = {
    uid: data?.files?.[0]?.uid || 'file-uid-1',
    dxid: data?.files?.[0]?.uid || 'file-dxid-1',
    file_license: {
      id: '1',
      title: 'MIT License',
      uid: 'license-uid-1',
    } as FileLicense,
  }

  const { modalComp, setShowModal } = useAcceptLicenseModal({
    selected: fileWithLicense,
    resource: 'files',
    onSuccess: () => {
      console.log('License accepted successfully')
    },
  })

  useEffect(() => {
    setShowModal(true)
  }, [])

  return modalComp
}

export const AcceptLicenseModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <AcceptLicenseModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const AttachLicensesModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const fileForLicense = {
    uid: data?.files?.[0]?.uid || 'file-uid-1',
    dxid: data?.files?.[0]?.uid || 'file-dxid-1',
    file_license: undefined as FileLicense | undefined,
  }

  const { modalComp, setShowModal } = useAttachLicensesModal({
    selected: fileForLicense,
    resource: 'files',
    onSuccess: () => {
      console.log('License attached successfully')
    },
  })

  useEffect(() => {
    setShowModal(true)
  }, [])

  return modalComp
}

export const AttachLicensesModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <AttachLicensesModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const DetachLicenseModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const fileWithLicense = {
    uid: data?.files?.[0]?.uid || 'file-uid-1',
    dxid: data?.files?.[0]?.uid || 'file-dxid-1',
    file_license: {
      id: '1',
      title: 'MIT License',
      uid: 'license-uid-1',
    } as FileLicense,
  }

  const { modalComp, setShowModal } = useDetachLicenseModal({
    selected: fileWithLicense,
    resource: 'files',
    onSuccess: () => {
      console.log('License detached successfully')
    },
  })

  useEffect(() => {
    setShowModal(true)
  }, [])

  return modalComp
}

export const DetachLicenseModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <DetachLicenseModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const AcceptLicensesWithApprovalModalWrapper = () => {
  const { modalComp, setLicensesAndShow } = useAcceptLicensesModal()
  
  const licensesWithApproval = [
    mockLicenses[0], // MIT - no approval required
    mockLicenses[1], // Commercial - approval required, pending
    {
      ...mockLicenses[1],
      id: '4',
      uid: 'license-uid-4',
      title: 'Enterprise License (Approved)',
      state: 'approved',
    },
  ]

  useEffect(() => {
    setLicensesAndShow(licensesWithApproval, mockAcceptedLicenses)
  }, [])
  
  return modalComp
}

export const AcceptLicensesWithApprovalModal: Story = {
  render: () => <AcceptLicensesWithApprovalModalWrapper />,
}

export default meta
