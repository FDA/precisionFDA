import { useMutation } from '@tanstack/react-query'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { resendActivationEmail } from '@/features/admin/pendingUsers/api'
import type { BackendError } from '../types'

export const useResendActivationEmailMutation = () =>
  useMutation({
    mutationKey: ['resend-activation-email'],
    mutationFn: resendActivationEmail,
    onSuccess: () => {
      toastSuccess('Activation email was resent to the user')
    },
    onError: (e: BackendError) => {
      toastError(`Failed to resend activation email to the user: ${e.error.message}`)
    },
  })
