import { AxiosError } from 'axios'
import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { formatMutationErrors } from '../../../hooks/useMutationErrorEffect'
import NavigationBar from '../../../views/components/NavigationBar/NavigationBar'
import { UserLayout } from '../../../views/layouts/UserLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { createChallengeCardImage, createChallengeRequest } from './api'
import { ChallengeForm } from './ChallengeForm'
import { subtitle, title } from './common'

export const CreateChallengePage = () => {
  const history = useHistory()
  const user = useAuthUser()
  const [isSavingChallenge, setIsSavingChallenge] = useState(false)

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: any) => createChallengeRequest(payload),
    onSuccess: res => {
      setIsSavingChallenge(false)
      if (res?.challenge) {
        queryClient.invalidateQueries('challenges')
        history.push('/challenges')
        toast.success('Success: Creating challenge.')
      } else if (res?.error) {
        toast.error(`${res.error.type}: ${res.error.message}`)
      } else {
        toast.error('Something went wrong!')
      }
    },
    onError: () => {
      setIsSavingChallenge(false)
      toast.error('Error: Adding challenge.')
    },
  })

  const mutationErrors = formatMutationErrors(
    mutation.error instanceof AxiosError
      ? mutation.error.response?.data
      : undefined,
  )

  const imageMutation = useMutation({
    mutationFn: (v: any) =>
      createChallengeCardImage(v.cardImage[0], img =>
        mutation.mutateAsync({
          name: v.name,
          description: v.description,
          scope: v.scope?.value,
          app_owner_id: v.app_owner_id?.value,
          start_at: v.start_at,
          end_at: v.end_at,
          status: v.status?.value,
          host_lead_dxuser: v.host_lead_dxuser?.value,
          guest_lead_dxuser: v.guest_lead_dxuser?.value,
          card_image_id: img.id,
          card_image_url: img.url,
          pre_registration_url: v.pre_registration_url,
        }),
      ),
    onError: () => setIsSavingChallenge(false),
  })

  const handleSubmit = async (v: any) => {
    setIsSavingChallenge(true)
    await imageMutation.mutateAsync(v)
  }

  return (
    <UserLayout>
      <NavigationBar title={title} subtitle={subtitle} user={user} />
      <BackLinkMargin linkTo="/challenges">Back to Challenges</BackLinkMargin>
      {user?.can_create_challenges ? (
        <StyledPageCenter>
          <StyledPageContent>
            <PageTitle>Create a new challenge</PageTitle>
            <ChallengeForm
              onSubmit={handleSubmit}
              isSavingChallenge={isSavingChallenge}
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
