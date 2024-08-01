import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { formatMutationErrors } from '../../../hooks/useMutationErrorEffect'
import { UserLayout } from '../../../layouts/UserLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { ChallengePayload, createChallengeRequest } from '../api'
import { IChallengeForm, ChallengeForm } from './ChallengeForm'
import { mapFormToPayload, subtitle, title } from './common'

const CreateChallengePage = () => {
  const navigate = useNavigate()
  const user = useAuthUser()

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['create-challenge'],
    mutationFn: (payload: ChallengePayload) => createChallengeRequest(payload),
    onSuccess: res => {
      if (res?.challenge) {
        queryClient.invalidateQueries({
          queryKey: ['challenges'],
        })
        navigate('/challenges')
        toast.success('Challenge has been created')
      } else if (res?.error) {
        toast.error(`${res.error.type}: ${res.error.message}`)
      } else {
        toast.error('Error: Something went wrong')
      }
    },
    onError: () => {
      toast.error('Error: Adding challenge')
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

  return (
    <UserLayout mainScroll>
      <NavigationBar title={title} subtitle={subtitle} user={user} />
      <StyledPageCenter>
        <StyledPageContent>
          <BackLinkMargin linkTo="/challenges">
            Back to Challenges
          </BackLinkMargin>
          {user?.can_create_challenges ? (
            <>
              <PageTitle>Create a new challenge</PageTitle>
              <ChallengeForm
                onSubmit={handleSubmit}
                isSaving={mutation.isPending}
                mutationErrors={mutationErrors}
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

export default CreateChallengePage
