import { AxiosError } from 'axios'
import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { formatMutationErrors } from '../../../hooks/useMutationErrorEffect'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import { UserLayout } from '../../../layouts/UserLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { createChallengeCardImage, createChallengeRequest, getChallengeImageLink } from './api'
import { ChallengeForm } from './ChallengeForm'
import { subtitle, title } from './common'

const CreateChallengePage = () => {
  const history = useHistory()
  const user = useAuthUser()
  const [isSaving, setIsSaving] = useState(false)
  const [imgUid, setImageUid] = useState('')

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['create-challenge'],
    mutationFn: (payload: any) => createChallengeRequest(payload),
    onSuccess: res => {
      setIsSaving(false)
      if (res?.challenge) {
        queryClient.invalidateQueries(['challenges'])
        history.push('/challenges')
        toast.success('Challenge created successfully.')
      } else if (res?.error) {
        toast.error(`${res.error.type}: ${res.error.message}`)
      } else {
        toast.error('Something went wrong!')
      }
    },
    onError: () => {
      setIsSaving(false)
      toast.error('Error: Adding challenge.')
    },
  })

  const mutationErrors = formatMutationErrors(
    mutation.error instanceof AxiosError
      ? mutation.error.response?.data
      : undefined,
  )

  const imageMutation = useMutation({
    mutationFn: (v: any) => createChallengeCardImage(v),
    onError: () => setIsSaving(false),
    mutationKey: ['create-challenge-image'],
  })

  const linkMutation = useMutation({
    mutationFn: (fileUid: string) => getChallengeImageLink(fileUid),
  })

  const handleImageSelection = async (img: File) => {
    const result = await imageMutation.mutateAsync(img)
    setImageUid(result)
  }

  const handleSubmit = async (v: any) => {
    setIsSaving(true)
    const link = await linkMutation.mutateAsync(imgUid)
    await mutation.mutateAsync({
      name: v.name,
      description: v.description,
      scope: v.scope?.value,
      app_owner_id: v.app_owner_id?.value,
      start_at: v.start_at,
      end_at: v.end_at,
      status: v.status?.value,
      host_lead_dxuser: v.host_lead_dxuser?.value,
      guest_lead_dxuser: v.guest_lead_dxuser?.value,
      card_image_id: imgUid,
      card_image_url: link.url,
      pre_registration_url: v.pre_registration_url,
    })
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
              onImageSelection={handleImageSelection}
              isSaving={isSaving}
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

export default CreateChallengePage
