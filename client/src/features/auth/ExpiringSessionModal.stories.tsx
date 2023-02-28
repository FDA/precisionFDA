import { Meta } from '@storybook/react'
import React, { useEffect } from 'react'
import { ExpiringSessionModal } from './ExpiringSessionModal'
import { useModal } from '../modal/useModal'
import { StorybookProviders } from '../../stories/StorybookProviders'

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
