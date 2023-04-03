import { Meta } from '@storybook/react'
import React, { useEffect } from 'react'
import { AuthModal as AuthModalComp } from './AuthModal'
import { useModal } from '../modal/useModal'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useGenerateKeyModal } from './useGenerateKeyModal'

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

const GenKeyModalWrapper = () => {
  const { modalComp, setShowModal } = useGenerateKeyModal()

  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const GnerateKeyModal = {
  render: () => (
    <StorybookProviders>
      <GenKeyModalWrapper />
    </StorybookProviders>
  ),
}

export default meta
