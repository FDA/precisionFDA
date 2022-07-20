import React from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'
import { BackLink } from '../../../components/Page/PageBackLink'
import { PageContentItems, PageTitle } from '../../../components/Page/styles'
import { createSpaceRequest } from '../spaces.api'
import { SpaceForm } from './SpaceForm'

export const CreateSpace = () => {
  const history = useHistory()

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createSpaceRequest,
    onSuccess: res => {
      if (res?.space) {
        history.push(`/spaces/${res?.space?.id}`)
        queryClient.invalidateQueries('spaces')
        toast.success('Success: creating space.')
      } else if (res?.error) {
        toast.error(`${res.error?.type}: ${res.error.message}`)
      } else {
        toast.error('Something went wrong!')
      }
    },
    onError: () => {
      toast.error('Error: Creating space.')
    },
  })

  return (
    <PageContentItems>
      <BackLink linkTo="/spaces">Back to Spaces</BackLink>
      <PageTitle>Create Space</PageTitle>
      <SpaceForm mutation={mutation} />
    </PageContentItems>
  )
}
