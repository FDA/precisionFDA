import { Meta } from '@storybook/react-vite'
import { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useModal } from '../modal/useModal'
import { SessionExpiredModal as AuthModalComp } from './SessionExpiredModal'
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
