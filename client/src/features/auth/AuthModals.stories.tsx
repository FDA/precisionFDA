import { Meta } from '@storybook/react'
import React, { useEffect } from 'react'
import { AuthModal as AuthModalComp } from './AuthModal'
import { useModal } from '../modal/useModal'
import { StorybookProviders } from '../../stories/StorybookProviders'

const meta: Meta = {
  title: 'Modals/Auth',
}

const AuthModalWrapper = () => {
  const modal = useModal()
  useEffect(() => {
    modal.setShowModal(true)
  }, [])
  return <AuthModalComp {...modal} />
}

export const AuthModal = {
  render: () => (
    <StorybookProviders>
      <AuthModalWrapper />
    </StorybookProviders>
  ),
}

export default meta
