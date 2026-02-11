import { Meta } from '@storybook/react-vite'
import { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useModal } from '../modal/useModal'
import { ExpiringSessionModal } from './ExpiringSessionModal'

const meta: Meta = {
  title: 'Modals/Auth',
}

const SessionExpiredModalWrapper = () => {
  const modal = useModal()
  useEffect(() => {
    modal.setShowModal(true)
  }, [])
  return <ExpiringSessionModal modal={modal} />
}

export const SessionExpiredModal = {
  render: () => (
    <StorybookProviders>
      <SessionExpiredModalWrapper />
    </StorybookProviders>
  ),
}

export default meta
