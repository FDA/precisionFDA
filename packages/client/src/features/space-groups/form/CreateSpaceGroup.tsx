import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PageTitle } from '../../../components/Page/styles'
import { StyledBack, StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { SpaceGroupForm } from './SpaceGroupForm'
import { createSpaceGroupRequest } from '../spaceGroups.api'
import { SpaceGroupCreateFormData } from './SpaceGroupForm'

export const CreateSpaceGroup = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const spaceGroupMutation = useMutation({
    mutationKey: ['create-space-group'],
    mutationFn: createSpaceGroupRequest,
  })

  const onSubmit = async (formData: SpaceGroupCreateFormData) => {
    const payload = {
      name: formData.name,
      description: formData.description,
    }

    try {
      await spaceGroupMutation.mutateAsync(payload)
      navigate('/spaces')
      queryClient.invalidateQueries({
        queryKey: ['space-group-list'],
      })
      toast.success('Space Group created')
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message || 'Unknown error'
      toast.error(`Error while creating Space Group: ${message}`)
    }
  }

  return (
    <UserLayout mainScroll>
      <StyledPageCenter>
        <StyledPageContent>
          <StyledBack linkTo="/spaces">Back to Spaces</StyledBack>
          <PageTitle>Create a new Space Group</PageTitle>
          <SpaceGroupForm onSubmit={onSubmit} isSubmitting={spaceGroupMutation.isPending} />
        </StyledPageContent>
      </StyledPageCenter>
    </UserLayout>
  )
}
