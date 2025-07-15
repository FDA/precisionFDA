import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useState } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import { GoogleReCaptchaV3 } from '../../../components/ReCaptchaV3'
import { formatMutationErrors } from '../../../hooks/useMutationErrorEffect'
import PublicLayout from '../../../layouts/PublicLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { ProposeChallengePayload, proposeChallengeRequest } from './api'
import { ProposeChallengeForm, ProposeChallengeFormValues } from './ProposeChallengeForm'

const StyledProposeChallengePage = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  align-items: stretch;
  max-width: 1330px;
  margin-left: auto;
  margin-right: auto;
  flex: 1;
`
const LeftColumn = styled.div`
  width: 288px;
  flex: 0 0 288px;
  padding-top: 24px;
  padding-bottom: 24px;
  padding-left: 32px;
  padding-right: 0;

  p {
    margin-bottom: 8px;
  }
`
const MiddleColumn = styled.div`
  flex-grow: 1;
  padding-left: 32px;
  padding-right: 32px;
  padding-top: 24px;
  padding-bottom: 24px;
  overflow-x: auto;
`
const ProposeChallengeHeading = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
`

const ProposeChallengePage = () => {
  const user = useAuthUser()
  const isLoggedIn = user && Object.keys(user).length > 0
  const [triggerCaptcha, setTriggerCaptcha] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [values, setValues] = useState<ProposeChallengeFormValues>()

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['propose-challenge'],
    mutationFn: (payload: ProposeChallengePayload) => proposeChallengeRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['challenges'],
      })
      setSubmissionSuccess(true)
      toast.success('Your challenge proposal has been received')
    },
    onError: () => {
      toast.error('Something went wrong submitting your challenge proposal')
    },
  })

  const mutationErrors = formatMutationErrors(mutation.error instanceof AxiosError ? mutation.error.response?.data : undefined)

  const handleSubmit = async (v: ProposeChallengeFormValues) => {
    if (!isLoggedIn && PROD_OR_STAGE) {
      setValues(v)
      setTriggerCaptcha(true)
    } else {
      await mutation.mutateAsync(v)
    }
  }

  const onCaptchaSuccess = async (captchaValue: string) => {
    setTriggerCaptcha(false)
    let data = values
    data.captchaValue = captchaValue
    await mutation.mutateAsync(values)
  }

  const thankYouMessage = () => {
    return (
      <div className="challenge-propose-form-container__success">
        <h3>Thank you</h3>
        <p>Your challenge proposal has been submitted successfully! You will hear from us shortly.</p>
      </div>
    )
  }

  const renderContent = () => {
    return (
      <StyledProposeChallengePage>
        <LeftColumn>
          <ProposeChallengeHeading>Propose a Challenge</ProposeChallengeHeading>
          <p>
            Do you have an idea, an objective, a dataset, an algorithm, or any combination of the above that you would like to put
            in front of the precisionFDA expert community.
          </p>
          <p>Feel free to let us know! We would love to discuss this with you.</p>
        </LeftColumn>
        <MiddleColumn>
          {submissionSuccess ? (
            thankYouMessage()
          ) : (
            <ProposeChallengeForm onSubmit={handleSubmit} mutationErrors={mutationErrors} />
          )}
          {triggerCaptcha && <GoogleReCaptchaV3 callback={onCaptchaSuccess} action="propose" />}
        </MiddleColumn>
      </StyledProposeChallengePage>
    )
  }

  const renderContentWithCaptcha = () => {
    return (
      <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY} useEnterprise>
        {renderContent()}
      </GoogleReCaptchaProvider>
    )
  }

  return (
    <PublicLayout mainScroll={!!user}>
      <NavigationBar user={user} />
      {!isLoggedIn && PROD_OR_STAGE ? renderContentWithCaptcha() : renderContent()}
    </PublicLayout>
  )
}

export default ProposeChallengePage
