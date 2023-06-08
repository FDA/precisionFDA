import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHistory, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { Loader } from '../../../components/Loader'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { createSpaceRequest, spaceRequest } from '../spaces.api'
import { SpaceForm } from './CreateSpaceForm'
import { StyledPageCenter, StyledPageContent } from './styles'

export const DuplicateSpace = () => {
  const history = useHistory()
  const { spaceId } = useParams<{ spaceId: string }>()
  const { data } = useQuery(['space', spaceId], () =>
    spaceRequest({ id: spaceId }),
  )

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['duplicate-space'],
    mutationFn: createSpaceRequest,
    onSuccess: res => {
      if (res?.space) {
        history.push(`/spaces/${res?.space?.id}`)
        queryClient.invalidateQueries(['spaces'])
        toast.success('Success: duplicating space.')
      } else if (res?.error) {
        toast.error(`${res.error.type}: ${res.error.message}`)
      } else {
        toast.error('Something went wrong!')
      }
    },
    onError: () => {
      toast.error('Error: Duplicating space.')
    },
  })

  if (!data?.space) {
    return <Loader />
  }

  return (
    <>
      <BackLinkMargin linkTo={`/spaces/${spaceId}`}>Back to Space</BackLinkMargin>
      <StyledPageCenter>
        <StyledPageContent>
          <PageTitle>Duplicate Space</PageTitle>
          <SpaceForm
            mutation={mutation}
            defaultValues={{
              space_type: data.space.type,
              name: `${data.space.name} (copy)`,
              description: data.space.description,
              review_lead_dxuser: data.space.host_lead.dxuser,
              sponsor_lead_dxuser: data.space.guest_lead.dxuser,
              cts: data.space.cts,
            }}
            isDuplicate
          />
        </StyledPageContent>
      </StyledPageCenter>
    </>
  )
}
