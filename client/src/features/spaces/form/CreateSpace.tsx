import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'
import { PageTitle } from '../../../components/Page/styles'
import { createSpaceRequest } from '../spaces.api'
import { SpaceForm } from './CreateSpaceForm'
import { StyledBack, StyledPageCenter, StyledPageContent } from './styles'

export const CreateSpace = () => {
  const history = useHistory()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['create-space'],
    mutationFn: createSpaceRequest,
    onSuccess: res => {
      if (res?.space) {
        history.push(`/spaces/${res?.space?.id}`)
        queryClient.invalidateQueries(['spaces'])
        toast.success('Success: creating space.')
      } else if (res?.errors) {
        toast.error(`${res.errors[0]}`)
      } else {
        toast.error('Something went wrong!')
      }
    },
    onError: () => {
      toast.error('Error: Creating space.')
    },
  })

  return (
    <StyledPageCenter>
      <StyledPageContent>
        <StyledBack linkTo="/spaces">Back to Spaces</StyledBack>
        <PageTitle>Create Space</PageTitle>
        <SpaceForm mutation={mutation} />
      </StyledPageContent>
    </StyledPageCenter>
  )
}
