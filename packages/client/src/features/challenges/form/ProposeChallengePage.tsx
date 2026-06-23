import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Link } from 'react-router'
import { Button } from '@/components/Button'
import { CircleCheckIcon } from '@/components/icons/CircleCheckIcon'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { GoogleReCaptchaV3 } from '@/components/ReCaptchaV3'
import { formatMutationErrors } from '@/hooks/useMutationErrorEffect'
import { getRuntimeEnv } from '@/utils/runtimeEnv'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import PublicLayout from '../../../layouts/PublicLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { type ProposeChallengePayload, proposeChallengeRequest } from './api'
import { ProposeChallengeForm, type ProposeChallengeFormValues } from './ProposeChallengeForm'

const ProposeChallengePage = () => {
  const user = useAuthUser()
  const isLoggedIn = user && Object.keys(user).length > 0
  const [triggerCaptcha, setTriggerCaptcha] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [values, setValues] = useState<ProposeChallengeFormValues>()
  const recaptchaSiteKey = getRuntimeEnv().RECAPTCHA_SITE_KEY

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['propose-challenge'],
    mutationFn: (payload: ProposeChallengePayload) => proposeChallengeRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['challenges'],
      })
      setSubmissionSuccess(true)
      toastSuccess('Your challenge proposal has been received')
    },
    onError: () => {
      toastError('Something went wrong submitting your challenge proposal')
    },
  })

  const mutationErrors = formatMutationErrors(
    mutation.error instanceof AxiosError ? mutation.error.response?.data : undefined,
  )

  const handleSubmit = async (v: ProposeChallengeFormValues) => {
    if (!isLoggedIn && recaptchaSiteKey) {
      setValues(v)
      setTriggerCaptcha(true)
    } else {
      await mutation.mutateAsync(v)
    }
  }

  const onCaptchaSuccess = async (captchaValue: string) => {
    setTriggerCaptcha(false)
    const data = values as ProposeChallengePayload
    data.captchaValue = captchaValue
    await mutation.mutateAsync(data)
  }

  const thankYouMessage = () => {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-layout-border bg-(--tertiary-30) px-8 py-10 text-center">
        <span className="text-(--success-600)">
          <CircleCheckIcon height={48} />
        </span>
        <h3 className="m-0 text-lg font-semibold text-(--c-text-700)">Thank you</h3>
        <p className="m-0 max-w-105 text-(--c-text-500)">
          Your challenge proposal has been submitted successfully! You will hear from us shortly.
        </p>
        <Button as={Link} to="/challenges" data-variant="primary" className="mt-2">
          Back to Challenges
        </Button>
      </div>
    )
  }

  const renderContent = () => {
    return (
      <div className="mx-auto flex w-full max-w-225 flex-1 flex-col items-center gap-5 px-4 py-4 sm:px-8">
        <header className="w-full max-w-200 text-center">
          <h1 className="m-0 text-3xl font-semibold tracking-tight text-(--c-text-700)">Propose a Challenge</h1>
          <p className="mx-auto mt-3 max-w-220 text-balance text-base text-(--c-text-500)">
            Do you have an idea, an objective, a dataset, an algorithm, or any combination of the above that you would
            like to put in front of the precisionFDA expert community?
          </p>
          <p className="mt-1 text-base text-(--c-text-500)">
            Feel free to let us know — we would love to discuss this with you.
          </p>
        </header>
        <div className="w-full md:w-125">
          {submissionSuccess ? (
            thankYouMessage()
          ) : (
            <ProposeChallengeForm
              onSubmit={handleSubmit}
              mutationErrors={mutationErrors}
              pending={mutation.isPending || triggerCaptcha}
            />
          )}
          {triggerCaptcha && <GoogleReCaptchaV3 callback={onCaptchaSuccess} action="propose" />}
        </div>
      </div>
    )
  }

  const renderContentWithCaptcha = () => {
    return (
      <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey!} useEnterprise>
        {renderContent()}
      </GoogleReCaptchaProvider>
    )
  }

  return (
    <PublicLayout mainScroll={!!user}>
      <NavigationBar user={user} />
      {!isLoggedIn && recaptchaSiteKey ? renderContentWithCaptcha() : renderContent()}
    </PublicLayout>
  )
}

export default ProposeChallengePage
