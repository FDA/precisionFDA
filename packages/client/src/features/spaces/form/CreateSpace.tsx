import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { PageTitle } from '../../../components/Page/styles'
import { createSpaceRequest } from '../spaces.api'
import { SpaceForm } from './CreateSpaceForm'
import { StyledBack, StyledPageCenter, StyledPageContent } from './styles'
import { UserLayout } from '../../../layouts/UserLayout'

export const CreateSpace = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['create-space'],
    mutationFn: createSpaceRequest,
    onSuccess: res => {
      if (res?.id) {
        navigate(`/spaces/${res?.id}`)
        queryClient.invalidateQueries({
          queryKey: ['spaces'],
        })
        toast.success('Space successfully created')
      } else if (res?.errors) {
        toast.error(`${res.errors[0]}`)
      } else {
        toast.error('Something went wrong')
      }
    },
    onError: (error: AxiosError) => {
      if (error?.response?.data?.error?.message) {
        toast.error(error?.response?.data?.error?.message)
        return
      }
      toast.error('Error creating space')
    },
  })

  return (
    <UserLayout mainScroll>
      <StyledPageCenter>
        <StyledPageContent>
          <StyledBack linkTo="/spaces">Back to Spaces</StyledBack>
          <PageTitle>Create Space</PageTitle>
          <SpaceForm mutation={mutation} />
        </StyledPageContent>
      </StyledPageCenter>
    </UserLayout>
  )
}
