import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React from 'react'
import { useNavigate, useParams } from 'react-router'
import { Loader } from '../../../components/Loader'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { dateToInput } from '../../../utils/datetime'
import { useAuthUser } from '../../auth/useAuthUser'
import { StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { ChallengePayload, editChallengeRequest } from '../api'
import { useChallengeDetailsQuery } from '../useChallengeDetailsQuery'
import { ChallengeForm, IChallengeForm } from './ChallengeForm'
import { mapFormToPayload } from './common'
import { ApiErrorResponse } from '../../home/types'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

const EditChallengePage = () => {
  const navigate = useNavigate()
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const { challengeId } = useParams<{ challengeId: string }>()
  const { data, isLoading } = useChallengeDetailsQuery(challengeId!)

  const mutation = useMutation({
    mutationKey: ['edit-challenge'],
    mutationFn: (payload: ChallengePayload) => editChallengeRequest(payload, parseInt(challengeId!, 10)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['challenge-custom', challengeId],
      })
      queryClient.invalidateQueries({
        queryKey: ['challenge', challengeId],
      })
      navigate('/challenges')
      toastSuccess('Challenge successfully edited')
    },
    onError: (e: AxiosError<ApiErrorResponse>) => {
      if (e?.response?.data?.error?.message) {
        toastError(`Error: ${e?.response?.data?.error.message}`)
      } else {
        toastError('An error occurred while editing the challenge')
      }
    },
  })

  const handleSubmit = async (v: IChallengeForm) => {
    await mutation.mutateAsync(mapFormToPayload(v))
  }

  const challenge = data

  const defaultValues = challenge && {
    name: challenge?.name,
    description: challenge?.description,
    preRegistrationUrl: challenge?.pre_registration_url,
    cardImageUrl: challenge?.card_image_url,
    cardImageId: challenge?.card_image_id,
    startAt: dateToInput(challenge?.start_at),
    endAt: dateToInput(challenge?.end_at),
    status: {
      value: challenge?.status,
      label: challenge?.status,
    },
    scope: challenge?.scope && {
      value: challenge?.scope,
      label: challenge?.scope,
    },
    hostLeadDxuser: challenge?.host_lead_dxuser && {
      value: challenge?.host_lead_dxuser,
      label: challenge?.host_lead_dxuser,
    },
    guestLeadDxuser: challenge?.guest_lead_dxuser && {
      value: challenge?.guest_lead_dxuser,
      label: challenge?.guest_lead_dxuser,
    },
    appOwnerId: challenge?.app_owner_id && {
      value: challenge?.app_owner_id[1],
      label: challenge?.app_owner_id[0],
    },
  }

  return (
    <UserLayout mainScroll>
      <StyledPageCenter>
        <StyledPageContent>
          <BackLinkMargin linkTo={`/challenges/${challengeId}`}>Back to Challenge</BackLinkMargin>
          {isLoading ? (
            <Loader />
          ) : user?.can_create_challenges ? (
            <>
              <PageTitle>Settings for Challenge</PageTitle>
              <ChallengeForm
                defaultValues={defaultValues}
                challenge={data}
                onSubmit={handleSubmit}
                isSaving={mutation.isPending}
              />
            </>
          ) : (
            <NotAllowedPage />
          )}
        </StyledPageContent>
      </StyledPageCenter>
    </UserLayout>
  )
}

export default EditChallengePage
