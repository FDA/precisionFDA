import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import * as Yup from 'yup'
import { ButtonGroup } from '../../../components/Button/ButtonGroup'
import { ButtonSolidBlue, ButtonSolidRed } from '../../../components/Button/index'
import { Checkbox } from '../../../components/Checkbox'
import { InputDate } from '../../../components/form/InputDate'
import { FieldGroup, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { CheckboxLabel } from '../../spaces/form/styles'

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  ${ButtonGroup} {
    gap: 4px;
  }
`

export interface CreateNewsForm {
  title: string
  createdAt?: string
  video?: string
  content?: string
  link?: string
  isPublication?: boolean
  published?: boolean
}

const validationSchema = Yup.object().shape({
  title: Yup.string().min(3).max(255).required('Title required'),
  createdAt: Yup.string(),
  video: Yup.string().max(255),
  conent: Yup.string().min(3).max(100000),
  link: Yup.string().min(3).max(255),
  isPublication: Yup.boolean(),
  published: Yup.boolean(),
})

export const NewsItemForm = ({ onDelete, onSubmit, defaultValues } : { onDelete?: () => void, onSubmit: (vals: CreateNewsForm) => void, defaultValues?: CreateNewsForm}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<CreateNewsForm>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: '',
      createdAt: new Date().toISOString().substring(0,10),
      video: '',
      content: '',
      link: '',
      isPublication: false,
      published: false,
      ...defaultValues,
    },
  })

  const onSubmitForm = () => {
    const vals = getValues()
    let newVals = vals
    if(vals.video){
      newVals = { ...vals, video: vals.video.replace('/watch?v=', '/embed/') }
    }
    onSubmit(newVals)
  }

  const deleteNewsItem = () => {
    if(onDelete) onDelete()
  }

  return (
    <StyledForm onSubmit={handleSubmit(onSubmitForm)} autoComplete="off">
      <FieldGroup>
        <label>Title</label>
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
      <FieldGroup>
        <label>Date</label>
        <InputDate
          label="Date"
          {...register('createdAt', {
            setValueAs: (value) => new Date(value).toISOString().substring(0,10),
          })}
          disabled={isSubmitting}
        />
        <ErrorMessage
          errors={errors}
          name="createdAt"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>

      <FieldGroup>
        <label>Link</label>
        <InputText
          label="Link"
          {...register('link')}
          disabled={isSubmitting}
        />
        <ErrorMessage
          errors={errors}
          name="link"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>

      <FieldGroup>
        <label>Content</label>
        <InputText
          as="textarea"
          label="Content"
          {...register('content')}
          disabled={isSubmitting}
        />
        <ErrorMessage
          errors={errors}
          name="content"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>

      <FieldGroup>
        <label>Video</label>
        <InputText
          label="Video"
          {...register('video')}
          disabled={isSubmitting}
        />
        <ErrorMessage
          errors={errors}
          name="video"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>

      <FieldGroup>
        <CheckboxLabel>
          <Checkbox
          label="Publication"
          {...register('isPublication')}
          disabled={isSubmitting}
          />
          Publication
        </CheckboxLabel>
        
        <ErrorMessage
          errors={errors}
          name="isPublication"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>
      <FieldGroup>
        <CheckboxLabel>
          <Checkbox
          label="Published"
          {...register('published')}
          disabled={isSubmitting}
          />
          Published
        </CheckboxLabel>
        
        <ErrorMessage
          errors={errors}
          name="published"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>
      <ButtonGroup>
        <ButtonSolidBlue type="submit" disabled={isSubmitting || Object.keys(errors).length > 0}>Save</ButtonSolidBlue>
        {onDelete && <ButtonSolidRed type="button" onClick={deleteNewsItem}>Delete</ButtonSolidRed>}
      </ButtonGroup>
    </StyledForm>
  )
}
