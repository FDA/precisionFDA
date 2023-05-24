import { AxiosError } from 'axios'
import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { formatMutationErrors } from '../../../hooks/useMutationErrorEffect'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import { useAuthUser } from '../../auth/useAuthUser'
import { proposeChallengeRequest } from './api'
import { PrososeChallengeForm } from './ProposeChallengeForm'
import { subtitle, title } from './common'
import PublicLayout from '../../../layouts/PublicLayout'
import { GoogleReCaptchaV3 } from '../../../components/ReCaptchaV3'
import {
  ItemButton,
  RightList,
  RightSide,
  RightSideItem,
  SectionTitle,
} from '../../../components/Public/styles'
import { challengesYearsListRequest } from '../api'


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
`
const MiddleColumn = styled.div`
flex-grow: 1;
padding-left: 32px;
padding-right: 32px;
padding-top: 24px;
padding-bottom: 24px;
overflow-x: auto;
`
const RightColumn = styled.div`
width: 288px;
flex: 0 0 288px;
padding-left: 0;
padding-right: 32px;
padding-top: 24px;
padding-bottom: 24px;
`
const ProposeChallengeHeading = styled.div`
font-size: 20px;
font-weight: 600;
color: #000;
`

const ProposeChallengePage = () => {
  const history = useHistory()
  const user = useAuthUser()
  const isLoggedIn = user && Object.keys(user).length > 0
  const [isSavingChallenge, setIsSavingChallenge] = useState(false)
  const [triggerCaptcha, setTriggerCaptcha] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [values, setValues] = useState()

  const { data: yearsListData, isLoading: isLoadingYearsList } = useQuery(['challenges-years'], () => challengesYearsListRequest(), {
    onError: err => {
      console.log(err)
    },
  })

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['propose-challenge'],
    mutationFn: (payload: any) => proposeChallengeRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['challenges'])
      setSubmissionSuccess(true)
      toast.success('Your challenge proposal has been received.')
    },
    onError: () => {
      toast.error('Something went wrong submitting your challenge proposal.')
    },
  })

  const mutationErrors = formatMutationErrors(
    mutation.error instanceof AxiosError
      ? mutation.error.response?.data
      : undefined,
  )

  const handleSubmit = async (v: any) => {
    setIsSavingChallenge(true)
    if (!isLoggedIn) {
      setValues(v)
      setTriggerCaptcha(true)
    }
    else {
      await mutation.mutateAsync(v)
    }

  }

  const onCaptchaSuccess = async (captchaValue: string) => {
    setTriggerCaptcha(false)
    let data = values
    data.captchaValue = captchaValue
    await mutation.mutateAsync(values)
  }

  const renderContentWithCaptcha = () => {
    return (
      <GoogleReCaptchaProvider
        reCaptchaKey={RECAPTCHA_SITE_KEY}
        useEnterprise
      >
        {renderContent()}
      </GoogleReCaptchaProvider>
    )
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
          <p>Do you have an idea, an objective, a dataset, an algorithm, or any combination of the above that you would like to put in front of the precisionFDA expert community.</p>
          <p>Feel free to let us know! We would love to discuss this with you.</p>
        </LeftColumn>
        <MiddleColumn>
          {submissionSuccess ? thankYouMessage() :
            (<PrososeChallengeForm
              onSubmit={handleSubmit}
              isSavingChallenge={isSavingChallenge}
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
        <RightColumn>
          <RightSide>
            <RightSideItem>
              <SectionTitle>Filter Challenges</SectionTitle>
              <RightList>
                <ItemButton as={Link} to="/challenges">
                  All
                </ItemButton>
                <ItemButton
                  as={Link}
                  to="/challenges?time_status=current"
                >
                  Currently Open
                </ItemButton>
                <ItemButton
                  as={Link}
                  to="/challenges?time_status=upcoming"
                >
                  Upcoming
                </ItemButton>
                <ItemButton
                  as={Link}
                  to="/challenges?time_status=ended"
                >
                  Ended
                </ItemButton>
              </RightList>
            </RightSideItem>
            <RightSideItem>
              <SectionTitle>Previous Challenges</SectionTitle>
              <RightList>
                <ItemButton as={Link} to="/challenges">
                  All
                </ItemButton>
                {!isLoadingYearsList &&
                  yearsListData
                    ?.map(y => y.toString())
                    .map(y => (
                      <ItemButton
                        as={Link}
                        to={`/challenges?year=${y}`}
                        key={y}
                      >
                        {y}
                      </ItemButton>
                    ))}
              </RightList>
            </RightSideItem>
            <RightSideItem>
              <SectionTitle>Other Challenges</SectionTitle>
              <a href="/challenges/app-a-thon-in-a-box" data-turbolinks="false">
                App-a-thon in a Box &rarr;
              </a>
            </RightSideItem>

          </RightSide>
        </RightColumn>
      </StyledProposeChallengePage>
    )
  }

  return (
    <PublicLayout>
      <NavigationBar title={title} subtitle={subtitle} user={user} />
      {!isLoggedIn && PROD_OR_STAGE ? renderContentWithCaptcha() : renderContent()}
    </PublicLayout>
  )


}

export default ProposeChallengePage
