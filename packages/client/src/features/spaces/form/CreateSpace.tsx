import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate } from 'react-router'
import { AxiosError } from 'axios'
import { PageTitle } from '../../../components/Page/styles'
import { createSpaceRequest, spaceRequest } from '../spaces.api'
import { SpaceForm } from './CreateSpaceForm'
import { StyledBack, StyledPageCenter, StyledPageContent } from './styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { ApiErrorResponse } from '../../home/types'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

export const CreateSpace = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['create-space'],
    mutationFn: createSpaceRequest,
    onSuccess: async res => {
      if (res?.id) {
        try {
          const spaceDetails = await spaceRequest({ id: res.id })
          navigate(`/spaces/${spaceDetails?.space.id}`)
        } catch (e) {
          const err = e as AxiosError<ApiErrorResponse>
          if (err.response && err.response.status === 403) {
            navigate('/spaces')
          } else {
            toastError('Error fetching space details')
          }
        }
        toastSuccess('Space successfully created')
        queryClient.invalidateQueries({
          queryKey: ['spaces'],
        })
      } else if ('errors' in res && res?.errors && Array.isArray(res.errors)) {
        toastError(`${res.errors[0]}`)
      } else {
        toastError('Something went wrong')
      }
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      if (error?.response?.data?.error?.message) {
        toastError(error?.response?.data?.error?.message)
        return
      }
      toastError('Error creating space')
    },
  })

  return (
    <UserLayout mainScroll>
      <StyledPageCenter>
        <StyledPageContent>
          <StyledBack linkTo="/spaces">Back to Spaces</StyledBack>
          <PageTitle>Create a new Space</PageTitle>
          <SpaceForm mutation={mutation} />
        </StyledPageContent>
      </StyledPageCenter>
    </UserLayout>
  )
}
