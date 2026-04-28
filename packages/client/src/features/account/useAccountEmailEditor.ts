import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useEffectEvent, useRef, useState, type RefObject } from 'react'
import { getBackendErrorMessage } from '@/api/types'
import { isValidPrecisionEmailFormat } from '@/utils/emailFormat'
import type { UseModal } from '../modal/useModal'
import { useModal } from '../modal/useModal'
import type { ProfilePageData } from './profile.types'
import { profileKeys, useUpdateProfileMutation } from './useProfileQueries'

interface UseAccountEmailEditorArgs {
  profileEmail: string
}

export interface AccountEmailEditor {
  emailCredentialsModal: UseModal
  emailEditModal: UseModal
  emailFieldError: string | null
  emailInputRef: RefObject<HTMLInputElement | null>
  emailValue: string
  hasEmailChanges: boolean
  isSavingEmail: boolean
  credentialsError: string | null
  otp: string
  password: string
  closeEmailCredentialsModal: () => void
  closeEmailEditModal: () => void
  handleBackToEditNewEmail: () => void
  handleConfirmEmailChange: () => Promise<void>
  handleEditEmail: () => void
  handleEmailBlur: () => void
  handleEmailContinueClick: () => void
  setEmailValue: (value: string) => void
  setOtp: (value: string) => void
  setPassword: (value: string) => void
}

export function useAccountEmailEditor({ profileEmail }: UseAccountEmailEditorArgs): AccountEmailEditor {
  const queryClient = useQueryClient()
  const updateProfileMutation = useUpdateProfileMutation()
  const emailEditModal = useModal()
  const emailCredentialsModal = useModal()
  const [emailValue, setEmailValueState] = useState(profileEmail)
  const [password, setPasswordState] = useState('')
  const [otp, setOtpState] = useState('')
  const [credentialsError, setCredentialsError] = useState<string | null>(null)
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  const nextEmail = emailValue.trim()
  const hasEmailChanges = nextEmail.toLowerCase() !== profileEmail.trim().toLowerCase()
  const isSavingEmail = updateProfileMutation.isPending

  const syncEmailDraftFromProfile = useEffectEvent(() => {
    if (!emailEditModal.isShown && !emailCredentialsModal.isShown && !isSavingEmail) {
      setEmailValueState(profileEmail)
    }
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: must re-run when profile/modal state changes; Biome treats Effect Events as making these redundant
  useEffect(() => {
    syncEmailDraftFromProfile()
  }, [profileEmail, emailEditModal.isShown, emailCredentialsModal.isShown, isSavingEmail])

  const resetEmailCredentials = (): void => {
    setPasswordState('')
    setOtpState('')
    setCredentialsError(null)
  }

  const setEmailValue = (value: string): void => {
    setEmailValueState(value)
    setEmailFieldError(null)
  }

  const setPassword = (value: string): void => {
    setPasswordState(value)
    setCredentialsError(null)
  }

  const setOtp = (value: string): void => {
    setOtpState(value)
    setCredentialsError(null)
  }

  const handleEditEmail = (): void => {
    setEmailValueState(profileEmail)
    setEmailFieldError(null)
    resetEmailCredentials()
    emailEditModal.setShowModal(true)
  }

  const closeEmailEditModal = (): void => {
    if (isSavingEmail) return

    emailEditModal.setShowModal(false)
    setEmailFieldError(null)
  }

  const closeEmailCredentialsModal = (): void => {
    if (isSavingEmail) return

    emailCredentialsModal.setShowModal(false)
    resetEmailCredentials()
  }

  const handleBackToEditNewEmail = (): void => {
    if (isSavingEmail) return

    resetEmailCredentials()
    emailCredentialsModal.setShowModal(false)
    emailEditModal.setShowModal(true)
    setEmailFieldError(null)
  }

  const validationErrorForChangedEmail = (trimmed: string): string | null => {
    if (!trimmed) {
      return 'Enter an email address.'
    }
    if (!isValidPrecisionEmailFormat(trimmed)) {
      return 'Enter a valid email address (for example: name@organization.com).'
    }
    return null
  }

  const handleEmailBlur = (): void => {
    if (!hasEmailChanges) {
      setEmailFieldError(null)
      return
    }
    setEmailFieldError(validationErrorForChangedEmail(nextEmail))
  }

  const handleEmailContinueClick = (): void => {
    if (!hasEmailChanges) return

    const err = validationErrorForChangedEmail(nextEmail)
    if (err) {
      setEmailFieldError(err)
      return
    }

    setEmailFieldError(null)
    resetEmailCredentials()
    emailEditModal.setShowModal(false)
    emailCredentialsModal.setShowModal(true)
  }

  const handleConfirmEmailChange = async (): Promise<void> => {
    if (!hasEmailChanges) {
      closeEmailCredentialsModal()
      return
    }

    if (!isValidPrecisionEmailFormat(nextEmail)) {
      setCredentialsError('This email address is not valid. Close this dialog, edit the address, and try again.')
      return
    }

    if (!password.trim() && !otp.trim()) {
      setCredentialsError('Enter your password and a fresh one-time code from your authenticator app.')
      return
    }
    if (!password.trim()) {
      setCredentialsError('Enter your password.')
      return
    }
    if (!otp.trim()) {
      setCredentialsError('Enter a one-time code from your authenticator app. Use a new code, not one you already used.')
      return
    }

    try {
      const updatedProfile = await updateProfileMutation.mutateAsync({
        email: nextEmail,
        password: password.trim(),
        otp: otp.trim(),
      })

      queryClient.setQueryData<ProfilePageData | undefined>(profileKeys.page(), current =>
        current ? { ...current, profile: updatedProfile } : current,
      )

      setEmailValueState(updatedProfile.email)
      setEmailFieldError(null)
      emailCredentialsModal.setShowModal(false)
      resetEmailCredentials()
    } catch (error) {
      setCredentialsError(
        getBackendErrorMessage(
          error,
          'Unable to update your email. Check the new address, your password, and a fresh one-time code, then try again.',
        ),
      )
    }
  }

  return {
    emailCredentialsModal,
    emailEditModal,
    emailFieldError,
    emailInputRef,
    emailValue,
    hasEmailChanges,
    isSavingEmail,
    credentialsError,
    otp,
    password,
    closeEmailCredentialsModal,
    closeEmailEditModal,
    handleBackToEditNewEmail,
    handleConfirmEmailChange,
    handleEditEmail,
    handleEmailBlur,
    handleEmailContinueClick,
    setEmailValue,
    setOtp,
    setPassword,
  }
}
