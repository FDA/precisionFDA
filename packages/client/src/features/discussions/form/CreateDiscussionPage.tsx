import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { PageTitle } from '../../../components/Page/styles'
import { getSpaceIdFromScope } from '../../../utils'
import { StyledBackLink } from '../../home/home.styles'
import { FormPageContainer } from '../../news/form/styles'
import { createDiscussionRequest, NoteScope } from '../api'
import { DiscussionForm as DiscussionFormType } from '../discussions.types'
import { pickIdsFromFormAttachments } from '../helpers'
import { DiscussionForm } from './DiscussionForm'

const WarningSection = styled.div`
  background-color: var(--highlight-100);
  border-radius: 5px;
  padding: 10px 0 10px 15px;
  position: relative;
  margin-bottom: 10px;

  &:before {
    height: 100%;
    width: 4px;
    content: '';
    background: var(--highlight-500);
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }
`

const WarningTitle = styled.div`
  font-weight: bold;
  font-size: 1.2em;
`

const renderWarning = () => (
  <WarningSection>
    <WarningTitle>⚠️ Discussion Visibility</WarningTitle>
    <p>
      This discussion will be posted in the Shared area of this Interactive Review Space.
      <br />
      <b>All members</b> of this Space will be able to see this Discussion.
    </p>
  </WarningSection>
)

export const CreateDiscussionPage = ({ scope, displayWarning = false }: { scope: NoteScope; displayWarning: boolean }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const createDiscussionMutation = useMutation({
    mutationKey: ['create-discussion'],
    mutationFn: createDiscussionRequest,
    onSuccess: async data => {
      if (scope === 'public') {
        queryClient.invalidateQueries({ queryKey: ['discussions']})
        navigate(`/home/discussions/${data.id}`)
      } else {
        queryClient.invalidateQueries({ queryKey: ['space']})
        navigate(`/spaces/${getSpaceIdFromScope(scope)}/discussions/${data.id}`)
      }
    },
    onError: () => {
      toast.error('Error while creating discussion.')
    },
  })

  const handleSubmit = async (vals: DiscussionFormType) => {
    const notify =
      vals.notify.length && ['author', 'all'].includes(vals.notify[0].value)
        ? vals.notify[0].value
        : vals.notify.map(n => n.value)

    return createDiscussionMutation.mutateAsync({
      title: vals.title,
      content: vals.content,
      scope,
      notify,
      attachments: pickIdsFromFormAttachments(vals.attachments),
    })
  }

  const backPath = location.pathname.replace('/create', '')

  return (
    <FormPageContainer>
      <StyledBackLink linkTo={backPath}>Back to Discussions</StyledBackLink>
      {displayWarning && renderWarning()}
      <PageTitle>Create a discussion</PageTitle>
      <DiscussionForm onSubmit={handleSubmit} scope={scope} />
    </FormPageContainer>
  )
}
