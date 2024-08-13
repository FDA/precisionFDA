import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
import * as Yup from 'yup'
import { Button } from '../../../components/Button'
import { Checkbox } from '../../../components/Checkbox'
import { MarkdownEditor } from '../../../components/Markdown/MarkdownEditor'
import { CheckboxLabel } from '../../../components/form/styles'
import { AttachmentsList } from '../AttachmentsList'
import { NoteScope } from '../api'
import { NoteForm } from '../discussions.types'
import { Attachments } from './Attachments'

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  padding-top: 8px;
  align-self: stretch;
  border-radius: 6px;
  border: 1px solid var(--c-layout-border);
  background: var(--background);
`

const ButtonRow = styled.div`
  align-self: flex-end;
  padding: 8px;
  padding-top: 0;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
`

const validationSchema = Yup.object().shape({
  content: Yup.string().max(100000).required(),
})

export const MarkdownForm = ({
  canUserAnswer,
  isEdit = false,
  isComment = false,
  isAnswerComment = false,
  markdownInputRef,
  onCancel,
  onSubmit,
  defaultValues,
  submitText = 'Save',
  scope,
}: {
  canUserAnswer: boolean
  isEdit?: boolean
  isComment?: boolean
  isAnswerComment?: boolean
  markdownInputRef?: React.MutableRefObject<HTMLInputElement | null>
  onCancel?: (vals: NoteForm) => void
  onSubmit: (vals: NoteForm) => void
  defaultValues?: NoteForm
  submitText?: string
  scope: NoteScope
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { isDirty, errors, isSubmitting, isSubmitSuccessful },
    getValues,
    setValue,
    reset,
    watch,
  } = useForm<NoteForm>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      content: '',
      isAnswer: false,
      notifyAll: false,
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

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset()
    }
  }, [isSubmitSuccessful])

  const onSubmitForm = async () => {
    await onSubmit(getValues())
  }

  const deleteAttachment = (key: any, id: number) => {
    const v = getValues(key) as { id: number }[]
    const newAttachments = v.filter(a => a.id !== id)
    setValue(key, newAttachments)
  }

  const { attachments } = watch()

  return (
    <StyledForm id="commentForm" autoComplete="off">
      <Controller
        control={control}
        name="content"
        render={({ field }) => (
          <MarkdownEditor field={{ ...field, ref: markdownInputRef || field.ref }} disabled={isSubmitting} />
        )}
      />

      {watch().isAnswer && (
        <Controller
          name="attachments"
          control={control}
          render={({ field }) => (
            <AttachmentsList scope={scope} attachments={field.value} onRemoveAttachment={deleteAttachment} />
          )}
        />
      )}

      <ButtonRow>
        {watch().isAnswer && <Attachments scope={scope} setValue={setValue} attachments={attachments} />}
        {!isEdit && !isAnswerComment && isComment && (
          <>
            <CheckboxLabel data-tooltip-id="answer-checkbox" data-tooltip-content="You have already submitted an answer on this discussion.">
              <Checkbox
                {...register('isAnswer')}
                disabled={isSubmitting || !canUserAnswer}
                onChange={(event: any) => setValue('isAnswer', event.target.checked)}
              />
              Mark as Answer
            </CheckboxLabel>
            <Tooltip id="answer-checkbox" delayShow={1000} hidden={canUserAnswer} />
          </>
        )}
        {!isEdit && (isComment || isAnswerComment) && (
          <CheckboxLabel>
            <Checkbox
              {...register('notifyAll')}
              disabled={isSubmitting}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue('notifyAll', event.target.checked)}
            />
            Notify All Members
          </CheckboxLabel>
        )}
        {isComment && (isEdit || isAnswerComment) && <Button onClick={() => onCancel && onCancel(getValues())}>Cancel</Button>}
        <Button
          data-variant="primary"
          type="button"
          form="commentForm"
          disabled={!isDirty || isSubmitting || Object.keys(errors).length > 0}
          onClick={handleSubmit(onSubmitForm)}
        >
          {isSubmitting ? 'Saving' : submitText}
        </Button>
      </ButtonRow>
    </StyledForm>
  )
}
