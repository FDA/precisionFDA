import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
import * as Yup from 'yup'
import { ErrorMessage } from '@hookform/error-message'
import { Button } from '../../../components/Button'
import { Checkbox } from '../../../components/Checkbox'
import { MarkdownEditor, StyledMarkdownHelper, WeMarkdown } from '../../../components/Markdown/MarkdownEditor'
import { CheckboxLabel, InputError } from '../../../components/form/styles'
import { AttachmentsList } from '../AttachmentsList'
import { NoteScope } from '../api'
import { NoteForm } from '../discussions.types'
import { Attachments } from './Attachments'
import { NotifyMembersSelect } from './NotifyMembersSelect'
import { TabPanel } from '../../../components/TabsSwitch'
import ExternalLink from '../../../components/Controls/ExternalLink'
import { MarkdownIcon } from '../../../components/icons/MarkdownIcon'

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  padding-top: 8px;
  align-self: stretch;
  border-radius: 6px;
  border: 1px solid var(--c-layout-border);
  background: var(--background);
`
const MarkAsAnswer = styled.div`
  min-height: 34px;
`
const ButtonRow = styled.div`
  flex-grow: 1;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px 8px;
  min-height: 34px;
`
const ButtonRowActions = styled.div`
  flex-grow: 1;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: flex-start;
  align-self: stretch;
`
const ContentGroup = styled.div`
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
      notify: [],
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
    if (isSubmitSuccessful) reset()
  }, [isSubmitSuccessful])

  const onSubmitForm = async () => onSubmit(getValues())

  const deleteAttachment = (key: any, id: number) => {
    setValue(
      key,
      getValues(key).filter((a: { id: number }) => a.id !== id),
    )
  }

  const { attachments, isAnswer } = watch()

  return (
    <>
      <StyledForm id="commentForm" autoComplete="off">
        <ContentGroup>
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <MarkdownEditor field={{ ...field, ref: markdownInputRef || field.ref }} disabled={isSubmitting} />
            )}
          />
        </ContentGroup>

        {isAnswer && (
          <Controller
            name="attachments"
            control={control}
            render={({ field }) => <AttachmentsList attachments={field.value} onRemoveAttachment={deleteAttachment} />}
          />
        )}

        <ButtonRow>
          <StyledMarkdownHelper>
            <ExternalLink to="https://www.markdownguide.org/basic-syntax/">
              <WeMarkdown>
                <MarkdownIcon height={17} />
                Markdown Support
              </WeMarkdown>
            </ExternalLink>
          </StyledMarkdownHelper>

          <div className="flex gap-2">
            {isAnswer && <Attachments scope={scope} setValue={setValue} attachments={attachments} />}

            {!isEdit && !isAnswerComment && isComment && (
              <MarkAsAnswer>
                <CheckboxLabel
                  data-tooltip-id="answer-checkbox"
                  data-tooltip-content="You have already submitted an answer on this discussion."
                >
                  <Checkbox
                    {...register('isAnswer')}
                    disabled={isSubmitting || !canUserAnswer}
                    onChange={e => setValue('isAnswer', e.target.checked)}
                  />
                  Mark as Answer
                </CheckboxLabel>
                <Tooltip id="answer-checkbox" delayShow={1000} hidden={canUserAnswer} />
              </MarkAsAnswer>
            )}
          </div>
        </ButtonRow>
      </StyledForm>

      <ButtonRowActions>
        {!isEdit && (isComment || isAnswerComment) && scope !== 'public' && (
          <div>
            <Controller
              name="notify"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <NotifyMembersSelect
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  scope={scope}
                  isSubmitting={isSubmitting}
                />
              )}
            />
            <ErrorMessage errors={errors} name="scope" render={({ message }) => <InputError>{message}</InputError>} />
          </div>
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
      </ButtonRowActions>
    </>
  )
}
