import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import * as Yup from 'yup'
import {
  NotePayload,
  NoteScope,
  editAnswerRequest,
  editDiscussionRequest,
  fetchAttachmentsRequest,
} from '../api'

import { MarkdownEditor } from '../../../components/Markdown/MarkdownEditor'
import { InputError } from '../../../components/form/styles'
import { ButtonRow } from '../../modal/styles'
import { AttachmentsList } from '../AttachmentsList'
import { Note, NoteForm } from '../discussions.types'
import { groupByAttachmentType, pickIdsFromFormAttachments } from '../helpers'
import { Attachments } from './Attachments'
import { Button } from '../../../components/Button'

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 8px;
  border-radius: 6px;
  border: 1px solid #cbcbcb;

  ${ButtonRow} {
    align-self: flex-end;
    padding: 8px;
  }
`

const validationSchema = Yup.object().shape({
  content: Yup.string().max(100000).required(),
})

export const EditNoteForm = ({
  noteId,
  onCancel,
  onSubmit,
  defaultValues,
  scope,
}: {
  onCancel: (vals: NoteForm) => void
  onSubmit: (vals: NoteForm) => void
  defaultValues?: Partial<NoteForm>
  scope: NoteScope
  noteId: number
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
    watch,
  } = useForm<NoteForm>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      content: '',
      attachments: {},
      ...defaultValues,
    },
  })

  const { isLoading, data: attachmentsData } = useQuery({
    queryKey: ['attachments', noteId],
    queryFn: () => fetchAttachmentsRequest(noteId),
    enabled: !!noteId,
  })

  useEffect(() => {
    setValue('attachments', groupByAttachmentType(attachmentsData ?? []))
  }, [attachmentsData])

  const onSubmitForm = async () => {
    await onSubmit(getValues())
  }

  const deleteAttachment = (key: any, id: number) => {
    const v = getValues(key) as {id: number}[]
    const newAttachments = v.filter(a => a.id !== id)
    setValue(key, newAttachments)
  }

  return (
    <StyledForm id="commentForm" autoComplete="off">
      <Controller
        control={control}
        name="content"
        render={({ field }) => (
          <MarkdownEditor field={field} disabled={isSubmitting} />
        )}
      />
      <ErrorMessage
        errors={errors}
        name="content"
        render={({ message }) => <InputError>{message}</InputError>}
      />
      {!isLoading && (
        <AttachmentsList
          attachments={watch().attachments}
          scope={scope}
          onRemoveAttachment={deleteAttachment}
        />
      )}
      <ButtonRow>
        <Attachments setValue={setValue} attachments={watch().attachments} scope={scope} />
        <Button onClick={() => onCancel && onCancel(getValues())}>
          Cancel
        </Button>
        <Button
          data-variant="primary"
          type="button"
          form="commentForm"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          onClick={handleSubmit(onSubmitForm)}
        >
          {isSubmitting ? 'Saving' : 'Edit'}
        </Button>
      </ButtonRow>
    </StyledForm>
  )
}

export const EditNoteEntity = ({
  onSuccess,
  onCancel,
  note,
  discussionId,
  answerId,
}: {
  onSuccess?: () => void
  onCancel: (vals: NoteForm) => void
  note: Note
  discussionId: number
  answerId?: number
}) => {
  const queryClient = useQueryClient()

  const editNodeMutation = useMutation({
    mutationKey: ['edit-discussion'],
    mutationFn: (payload: NotePayload) => {
      if (answerId) {
        return editAnswerRequest(discussionId, answerId, payload)
      }
      return editDiscussionRequest(discussionId, payload)
    },
    onSuccess: () => {
      toast.success(`${answerId ? 'Answer': 'Discussion'} has been updated`)
      if (onSuccess) onSuccess()
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['discussion'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['attachments'],
      })
    },
    onError: () => {
      // todo investigate- can we show something less generic?
      toast.error('Error while editing discussion')
    },
  })

  const handleSubmit = async (vals: NoteForm) => {
    await editNodeMutation.mutateAsync({
      id: discussionId,
      content: vals.content,
      attachments: pickIdsFromFormAttachments(vals.attachments),
    })
  }

  const defaultValues = {
    content: note.content,
  }

  return (
    <EditNoteForm
      noteId={note.id}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      scope={note.scope}
    />
  )
}
