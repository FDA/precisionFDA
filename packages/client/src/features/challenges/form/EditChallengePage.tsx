/* eslint-disable no-nested-ternary */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader } from '../../../components/Loader'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
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
import { formatMutationErrors, mapFormToPayload, subtitle, title } from './common'

const EditChallengePage = () => {
  const navigate = useNavigate()
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const { challengeId } = useParams<{ challengeId: string }>()
  const { data, isLoading } = useChallengeDetailsQuery(challengeId, true)

  const mutation = useMutation({
    mutationKey: ['edit-challenge'],
    mutationFn: (payload: ChallengePayload) =>
      editChallengeRequest(payload, parseInt(challengeId, 10)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['challenge-custom', challengeId],
      })
      queryClient.invalidateQueries({
        queryKey: ['challenge', challengeId],
      })
      navigate('/challenges')
      toast.success('Challenge successfully edited')
    },
    onError: (e: AxiosError) => {
      if (e?.response?.data?.app_id)
        toast.error(`Error: ${e?.response?.data?.app_id}`)
    },
  })

  const mutationErrors = formatMutationErrors(
    mutation.error instanceof AxiosError
      ? mutation.error.response?.data
      : undefined,
  )

  const handleSubmit = async (v: IChallengeForm) => {
    await mutation.mutateAsync(mapFormToPayload(v))
  }

  const challenge = data

  const defaultValues = challenge && {
    name: challenge?.name,
    description: challenge?.description,
    pre_registration_url: challenge?.pre_registration_url,
    card_image_url: challenge?.card_image_url,
    card_image_id: challenge?.card_image_id,
    start_at: dateToInput(challenge?.start_at),
    end_at: dateToInput(challenge?.end_at),
    status: {
      value: challenge?.status,
      label: challenge?.status,
    },
    scope: challenge?.scope && {
      value: challenge?.scope,
      label: challenge?.scope,
    },
    host_lead_dxuser: challenge?.host_lead_dxuser && {
      value: challenge?.host_lead_dxuser,
      label: challenge?.host_lead_dxuser,
    },
    guest_lead_dxuser: challenge?.guest_lead_dxuser && {
      value: challenge?.guest_lead_dxuser,
      label: challenge?.guest_lead_dxuser,
    },
    app_owner_id: challenge?.app_owner_id && {
      value: challenge?.app_owner_id[1],
      label: challenge?.app_owner_id[0],
    },
  }

  return (
    <UserLayout mainScroll>
      <NavigationBar title={title} subtitle={subtitle} user={user} />
      <StyledPageCenter>
        <StyledPageContent>
          <BackLinkMargin linkTo={`/challenges/${challengeId}`}>
            Back to Challenge
          </BackLinkMargin>
          {isLoading ? (
            <Loader />
          ) : user?.can_create_challenges ? (
            <>
              <PageTitle>Editing Challenge: {data?.name}</PageTitle>
              <ChallengeForm
                defaultValues={defaultValues}
                challenge={data}
                onSubmit={handleSubmit}
                mutationErrors={mutationErrors}
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
