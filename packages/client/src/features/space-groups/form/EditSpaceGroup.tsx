import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PageTitle } from '../../../components/Page/styles'
import { StyledBack, StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { SpaceGroupForm } from './SpaceGroupForm'
import { updateSpaceGroupRequest } from '../spaceGroups.api'
import { useSpaceGroupByIdQuery } from '../queries'
import { Loader } from '../../../components/Loader'
import { SpaceGroupCreateFormData } from './SpaceGroupForm'
import { ResouceQueryErrorMessage } from '../../home/ResouceQueryErrorMessage'

export const EditSpaceGroup = () => {
  const { spaceGroupId } = useParams<{ spaceGroupId: string }>()
  const { data: spaceGroup, isLoading, error } = useSpaceGroupByIdQuery(spaceGroupId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const spaceGroupMutation = useMutation({
    mutationKey: ['update-space-group'],
    mutationFn:   updateSpaceGroupRequest,
  })

  const onSubmit = async (formData: SpaceGroupCreateFormData) => {
    if (spaceGroupId) {
      const payload = {
        name: formData.name,
        description: formData.description,
        id: parseInt(spaceGroupId),
      }

      try {
        await spaceGroupMutation.mutateAsync(payload)
        queryClient.invalidateQueries({
          queryKey: ['space-group-list'],
        })
        queryClient.invalidateQueries({
          queryKey: ['space-groups', spaceGroupId],
        })

        navigate(`/spaces?spaceGroupId=${spaceGroupId}`)

        toast.success('Space Group updated')
      } catch (err) {
        const message = err.response?.data?.error?.message || err.message || 'Unknown error'
        toast.error(`Error while editing space group: ${message}`)
      }
    }
  }

  if (error) return <ResouceQueryErrorMessage />

  if (isLoading || !spaceGroup) {
    return <Loader />
  }

  return (
    <UserLayout mainScroll>
      <StyledPageCenter>
        <StyledPageContent>
          <StyledBack linkTo={`/spaces?spaceGroupId=${spaceGroupId}`}>Back to Space Group</StyledBack>
          <PageTitle>Edit Space Group</PageTitle>
          <SpaceGroupForm
            mutationErrors={spaceGroupMutation.error as any}
            onSubmit={onSubmit}
            isSubmitting={spaceGroupMutation.isPending}
            defaultValues={{
              name: spaceGroup.name,
              description: spaceGroup.description,
            }}
          />
        </StyledPageContent>
      </StyledPageCenter>
    </UserLayout>
  )
}
