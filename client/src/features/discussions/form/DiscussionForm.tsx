import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import styled from 'styled-components'
import * as Yup from 'yup'
import { InputText } from '../../../components/InputText'
import { MarkdownEditor } from '../../../components/Markdown/MarkdownEditor'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { InputError } from '../../../components/form/styles'
import { ButtonRow } from '../../modal/styles'
import { AttachmentsList } from '../AttachmentsList'
import { NoteScope } from '../api'
import { DiscussionForm as DiscussionFormType } from '../discussions.types'
import { areAttachmentsEmpty } from '../helpers'
import { Attachments } from './Attachments'
import { StyledPage } from './styles'
import { Button } from '../../../components/Button'

const StyledAttachments = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
  margin-bottom: 128px;
`

const validationSchema = Yup.object().shape({
  title: Yup.string().min(1).max(255).required('Title required'),
  content: Yup.string().max(100000).required(),
  attachments: Yup.object().shape({
    files: Yup.array().of(Yup.object()).required(),
    assets: Yup.array().of(Yup.object()).required(),
    apps: Yup.array().of(Yup.object()).required(),
    jobs: Yup.array().of(Yup.object()).required(),
    comparisons: Yup.array().of(Yup.object()).required(),
  }),
})

export const DiscussionForm = ({
  scope,
  onDelete,
  onSubmit,
  defaultValues,
}: {
  scope: NoteScope
  onDelete?: () => void
  onSubmit: (vals: DiscussionFormType) => void
  defaultValues?: DiscussionFormType
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    getValues,
    watch,
    trigger,
    setValue,
  } = useForm<DiscussionFormType>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: '',
      content: '',
      attachments: {
        files: [],
        apps: [],
        comparisons: [],
        assets: [],
        jobs: [],
      },
      ...defaultValues,
    },
  })

  const onSubmitForm = async () => {
    const valid = await trigger()
    if (valid) {
      return onSubmit(getValues())
    }
  }
  const deleteDiscussion = () => {
    if (onDelete) onDelete()
  }

  const deleteAttachment = (key: any, id: number) => {
    const v = getValues(key)
    const newAttachments = v.filter(a => a.id !== id)
    setValue(key, newAttachments)
  }

  const { attachments } = watch()

  return (
    <StyledPage>
      <StyledForm id="discussionForm" autoComplete="off">
        <FieldGroup label="Title" required>
          <InputText
            label="Title"
            {...register('title', { required: 'title is required.' })}
            disabled={isSubmitting}
          />
          <ErrorMessage
            errors={errors}
            name="title"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <FieldGroup label="Content" required>
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <MarkdownEditor field={field} disabled={isSubmitting} />
            )}
          />
        </FieldGroup>
        {!areAttachmentsEmpty(attachments) && (
          <StyledAttachments>
            <AttachmentsList
              attachments={attachments}
              scope={scope}
              onRemoveAttachment={deleteAttachment}
            />
          </StyledAttachments>
        )}
        <ButtonRow>
          <Attachments scope={scope} value={attachments} setValue={setValue} />
          {onDelete && (
            <Button variant="warning" type="button" onClick={deleteDiscussion}>
              Delete
            </Button>
          )}
          <Button
            variant="primary"
            type="button"
            form="discussionForm"
            disabled={isSubmitting || !isValid}
            onClick={handleSubmit(onSubmitForm)}
          >
            {isSubmitting ? 'Saving' : 'Create'}
          </Button>
        </ButtonRow>
      </StyledForm>
    </StyledPage>
  )
}
