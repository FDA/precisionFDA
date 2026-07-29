import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { licensesMocks, mockAcceptedLicenses, mockLicenses } from '../../mocks/handlers/licenses.handlers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import type { FileLicense } from '../assets/assets.types'
import { useAcceptLicenseModal } from './useAcceptLicenseModal'
import { useAcceptLicensesModal } from './useAcceptLicensesModal'
import { useAttachLicensesModal } from './useAttachLicensesModal'
import { useDetachLicenseModal } from './useDetachLicenseModal'

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

const AcceptLicenseModalWrapper = () => {
  const fileWithLicense = {
    uid: 'file-accept-license-example-1',
    dxid: 'file-accept-license-example-1',
    fileLicense: {
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
  render: () => <AcceptLicenseModalWrapper />,
}

const AttachLicensesModalWrapper = () => {
  const fileForLicense = {
    uid: 'file-attach-license-example-1',
    dxid: 'file-attach-license-example-1',
    fileLicense: undefined as FileLicense | undefined,
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
  render: () => <AttachLicensesModalWrapper />,
}

const DetachLicenseModalWrapper = () => {
  const fileWithLicense = {
    uid: 'file-detach-license-example-1',
    dxid: 'file-detach-license-example-1',
    fileLicense: {
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
  render: () => <DetachLicenseModalWrapper />,
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
