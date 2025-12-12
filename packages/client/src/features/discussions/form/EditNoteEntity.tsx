import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import styled from 'styled-components'
import * as Yup from 'yup'
import { NotePayload, NoteScope, editDiscussionRequest, editReplyRequest, fetchDiscussionAttachmentsRequest } from '../api'
import { Button } from '../../../components/Button'
import { MarkdownEditor } from '../../../components/Markdown/MarkdownEditor'
import { InputError } from '../../../components/form/styles'
import { ButtonRow } from '../../modal/styles'
import { AttachmentsList } from '../AttachmentsList'
import { AttachmentKey, NoteForm } from '../discussions.types'
import { groupByAttachmentType, pickIdsFromFormAttachments } from '../helpers'
import { Attachments } from './Attachments'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

const StyledForm = styled.form`
  display: flex;
  align-self: stretch;
  flex-direction: column;
  padding-top: 8px;
  border-radius: 6px;
  border: 1px solid var(--c-layout-border);

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
    queryFn: () => fetchDiscussionAttachmentsRequest([noteId]),
    enabled: !!noteId,
  })

  useEffect(() => {
    setValue('attachments', groupByAttachmentType(attachmentsData?.[noteId] ?? []))
  }, [attachmentsData])

  const onSubmitForm = async () => {
    await onSubmit(getValues())
  }

  const deleteAttachment = (key: `attachments.${AttachmentKey}`, id: number | string) => {
    const v = getValues(key)
    const newAttachments = v.filter(a => a.id !== id)
    setValue(key, newAttachments)
  }

  return (
    <StyledForm id="commentForm" autoComplete="off">
      <Controller
        control={control}
        name="content"
        render={({ field }) => <MarkdownEditor field={field} disabled={isSubmitting} />}
      />
      <ErrorMessage errors={errors} name="content" render={({ message }) => <InputError>{message}</InputError>} />
      {!isLoading && <AttachmentsList attachments={watch().attachments} onRemoveAttachment={deleteAttachment} />}
      <ButtonRow>
        <Attachments setValue={setValue} attachments={watch().attachments} scope={scope} />
        <Button onClick={() => onCancel && onCancel(getValues())}>Cancel</Button>
        <Button
          data-variant="primary"
          type="button"
          form="commentForm"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          onClick={handleSubmit(onSubmitForm)}
        >
          {isSubmitting ? 'Saving' : 'Save'}
        </Button>
      </ButtonRow>
    </StyledForm>
  )
}

export const EditNoteEntity = ({
  onSuccess,
  onCancel,
  noteId,
  scope,
  content,
  discussionId,
  answerId,
}: {
  onSuccess?: () => void
  onCancel: (vals: NoteForm) => void
  scope: NoteScope
  content: string
  discussionId: number
  noteId: number
  answerId?: number
}) => {
  const queryClient = useQueryClient()

  const editNoteMutation = useMutation({
    mutationKey: ['edit-discussion'],
    mutationFn: (payload: NotePayload) => {
      if (answerId) {
        return editReplyRequest(discussionId, answerId, { ...payload, type: 'Answer' })
      }
      return editDiscussionRequest(discussionId, payload)
    },
    onSuccess: () => {
      toastSuccess(`${answerId ? 'Answer' : 'Discussion'} has been updated`)
      if (onSuccess) onSuccess()
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['discussion'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['attachments', discussionId],
      })
    },
    onError: () => {
      // todo investigate- can we show something less generic?
      toastError('Error while editing discussion')
    },
  })

  const handleSubmit = async (vals: NoteForm) => {
    await editNoteMutation.mutateAsync({
      id: discussionId,
      content: vals.content,
      attachments: pickIdsFromFormAttachments(vals.attachments),
    })
  }

  const defaultValues = {
    content,
  }

  return <EditNoteForm noteId={noteId} scope={scope} onCancel={onCancel} onSubmit={handleSubmit} defaultValues={defaultValues} />
}
