import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import styled from 'styled-components'
import { formatMutationErrors } from '../../../hooks/useMutationErrorEffect'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import { useAuthUser } from '../../auth/useAuthUser'
import { ProposeChallengePayload, proposeChallengeRequest } from './api'
import { ProposeChallengeForm, ProposeChallengeFormValues } from './ProposeChallengeForm'
import { subtitle, title } from './common'
import PublicLayout from '../../../layouts/PublicLayout'
import { GoogleReCaptchaV3 } from '../../../components/ReCaptchaV3'

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
    padding: 24px 0 24px 32px;
`
const MiddleColumn = styled.div`
    flex-grow: 1;
    padding: 24px 32px;
    overflow-x: auto;
`
const RightColumn = styled.div`
    width: 288px;
    flex: 0 0 288px;
    padding: 24px 32px 24px 0;
`
const ProposeChallengeHeading = styled.div`
    font-size: 20px;
    font-weight: 600;
    color: #000;
`

const ProposeChallengePage = () => {
    const user = useAuthUser()
    const isLoggedIn = user && Object.keys(user).length > 0
    const [triggerCaptcha, setTriggerCaptcha] = useState(false)
    const [submissionSuccess, setSubmissionSuccess] = useState(false)
    const [values, setValues] = useState({} as ProposeChallengePayload)


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

    const mutationErrors = formatMutationErrors(mutation.error?.response?.data)

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
        values.captchaValue = captchaValue
        await mutation.mutateAsync(values)
    }

    const thankYouMessage = () => {
        return (
            <div className="challenge-propose-form-container__success">
                <h3>Thank you!</h3>
                <p>Your challenge proposal has been submitted successfully! You will hear from us shortly.</p>
            </div>
        )
    }

    const renderContent = () => {
        return (
            <StyledProposeChallengePage>
                <LeftColumn>
                    <ProposeChallengeHeading>Propose a Challenge</ProposeChallengeHeading>
                    <p>Do you have an idea, an objective, a dataset, an algorithm, or any combination of the above that
                        you would like to put in front of the precisionFDA expert community.</p>
                    <p>Feel free to let us know! We would love to discuss this with you.</p>
                </LeftColumn>
                <MiddleColumn>
                    {submissionSuccess ? thankYouMessage() :
                        (<ProposeChallengeForm
                            onSubmit={handleSubmit}
                            mutationErrors={mutationErrors}
                        />)
                    }
                    {triggerCaptcha && (
                        <GoogleReCaptchaV3
                            callback={onCaptchaSuccess}
                            action="propose"
                        />
                    )}
                </MiddleColumn>
                <RightColumn/>
            </StyledProposeChallengePage>
        )
    }

    return (
        <PublicLayout mainScroll={!!user}>
            <NavigationBar title={title} subtitle={subtitle} user={user}/>
            {!isLoggedIn && PROD_OR_STAGE ?
                (<GoogleReCaptchaProvider
                    reCaptchaKey={RECAPTCHA_SITE_KEY}
                    useEnterprise
                >{renderContent()}
                </GoogleReCaptchaProvider>) : renderContent()}
        </PublicLayout>
    )
}

export default ProposeChallengePage
