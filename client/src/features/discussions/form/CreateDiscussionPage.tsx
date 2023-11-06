import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PageTitle } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { getSpaceIdFromScope } from '../../../utils'
import { StyledBackLink } from '../../home/home.styles'
import { FormPageContainer } from '../../news/form/styles'
import { NoteScope, createDiscussionRequest } from '../api'
import { DiscussionForm as DiscussionFormType } from '../discussions.types'
import { pickIdsFromFormAttachments } from '../helpers'
import { DiscussionForm } from './DiscussionForm'
import { usePublishNoteMutation } from './usePublishNoteMutation'

export const CreateDiscussionPage = ({ scope }: { scope: NoteScope }) => {
  const history = useHistory()
  const { url } = useRouteMatch()
  const queryClient = useQueryClient()

  const publishMutation = usePublishNoteMutation()

  const createDiscussionMutation = useMutation({
    mutationKey: ['create-discussion'],
    mutationFn: createDiscussionRequest,
    onSuccess: async (data, variables) => {
      await publishMutation.mutateAsync({
        id: data.id,
        scope,
        discussionId: data.id,
        isAnswer: false,
        toPublish: variables.attachments,
      })
      queryClient.invalidateQueries(['space'])
      history.push(
        `/spaces/${getSpaceIdFromScope(scope)}/discussions/${data.id}`,
      )
    },
    onError: () => {
      toast.error('Error while creating discussion.')
    },
  })

  const handleSubmit = async (vals: DiscussionFormType) => {
    return createDiscussionMutation.mutateAsync({
      title: vals.title,
      content: vals.content,
      attachments: pickIdsFromFormAttachments(vals.attachments),
    })
  }

  const backPath = url.replace('/create', '')

  return (
    <UserLayout>
      <FormPageContainer>
        <StyledBackLink linkTo={backPath}>Back to Discussions</StyledBackLink>
        <PageTitle>Create a discussion</PageTitle>
        <DiscussionForm onSubmit={handleSubmit} scope={scope} />
      </FormPageContainer>
    </UserLayout>
  )
}
