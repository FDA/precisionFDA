/* eslint-disable no-nested-ternary */
import { AxiosError } from 'axios'
import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHistory, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { Loader } from '../../../components/Loader'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { PageTitle } from '../../../components/Page/styles'
import { MutationErrors } from '../../../types/utils'
import { dateToInput } from '../../../utils/datetime'
import NavigationBar from '../../../views/components/NavigationBar/NavigationBar'
import { UserLayout } from '../../../views/layouts/UserLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { StyledBackLink } from '../../home/home.styles'
import { StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { useChallengeDetailsQuery } from '../useChallengeDetailsQuery'
import { editChallengeRequest } from './api'
import { ChallengeForm } from './ChallengeForm'
import { subtitle, title } from './common'

function formatMutationErrors(
  obj?: Record<string, any> | unknown,
): MutationErrors | undefined {
  const nObj = obj
  if (nObj) {
    delete nObj['app_id']
    return {
      errors: [obj['app_id']],
      fieldErrors: { ...nObj },
    }
  }
  return undefined
}

const EditChallengePage = () => {
  const history = useHistory()
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const { challengeId } = useParams<{ challengeId: string }>()
  const { data, isLoading } = useChallengeDetailsQuery(challengeId, true)

  const mutation = useMutation({
    mutationKey: ['edit-challenge'],
    mutationFn: (payload: any) => editChallengeRequest(payload, challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge-custom', challengeId])
      queryClient.invalidateQueries(['challenge', challengeId])
      history.push('/challenges')
      toast.success('Challenge successfully edited.')
    },
    onError: (e: AxiosError) => {
      if(e?.response?.data?.app_id) toast.error(`Error: ${e?.response?.data?.app_id}`)
    },
  })

  const mutationErrors = formatMutationErrors(
    mutation.error instanceof AxiosError
      ? mutation.error.response?.data
      : undefined,
  )

  const handleSubmit = async (v: any) => {
    await mutation.mutateAsync({
      name: v.name,
      description: v.description,
      scope: v.scope?.value,
      app_owner_id: v.app_owner_id?.value,
      start_at: v.start_at,
      end_at: v.end_at,
      status: v.status?.value,
      card_image_id: v.card_image_id,
      card_image_url: v.card_image_url,
      pre_registration_url: v.pre_registration_url,
    })
  }

  const challenge = data?.challenge

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
    <UserLayout>
      <NavigationBar title={title} subtitle={subtitle} user={user} />
      <StyledBackLink linkTo={`/challenges/${challengeId}`}>
        Back to Challenge
      </StyledBackLink>
      {isLoading ? (
        <Loader />
      ) : user?.can_create_challenges ? (
        <StyledPageCenter>
          <StyledPageContent>
            <PageTitle>Editing Challenge: {data?.challenge.name}</PageTitle>
            <ChallengeForm
              defaultValues={defaultValues}
              challenge={data?.challenge}
              onSubmit={handleSubmit}
              mutationErrors={mutationErrors}
            />
          </StyledPageContent>
        </StyledPageCenter>
      ) : (
        <NotAllowedPage />
      )}
    </UserLayout>
  )
}

export default EditChallengePage
