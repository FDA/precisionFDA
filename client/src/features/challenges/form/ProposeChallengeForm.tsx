/* eslint-disable jsx-a11y/label-has-associated-control */
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Prompt } from 'react-router'
import styled from 'styled-components'
import { ButtonSolidBlue } from '../../../components/Button'
import { FieldGroup, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { useMutationErrorEffect } from '../../../hooks/useMutationErrorEffect'
import { MutationErrors } from '../../../types/utils'
import { RadioButtonGroup } from '../../../components/form/RadioButtonGroup'
import { proposeValidationSchema } from './common'
import { SectionTitle } from '../../../components/Public/styles'

interface ProposeChallengeForm {
  name: string,
  email: string,
  organisation: string,
  specific_question: string,
  specific_question_text: string | null,
  data_details: string,
  data_details_text: string | null,
}

const StyledForm = styled.form`
  width: 100%;
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (min-width: 640px) {
    max-width: 500px;
  }
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

export const PrososeChallengeForm = ({
  onSubmit,
  isSavingChallenge = false,
  mutationErrors,
}: {
  onSubmit: (a: any) => Promise<any>
  isSavingChallenge?: boolean
  mutationErrors?: MutationErrors
}) => {

  const {
    control,
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ProposeChallengeForm>({
    mode: 'onBlur',
    resolver: yupResolver(proposeValidationSchema),
    defaultValues: {
      data_details: 'Yes',
      specific_question: 'Yes'
    },
  })

  const hasQuestion = watch().specific_question
  const hasData = watch().data_details

  useEffect(() => {
    if (hasQuestion === 'Yes') {
    } else {
      setValue('specific_question_text', null)
      clearErrors(['specific_question_text'])
    }
  }, [watch().specific_question])
  useEffect(() => {
    if (hasData === 'Yes') {
    } else {
      setValue('data_details_text', null)
      clearErrors(['data_details_text'])

    }
  }, [watch().data_details])


  useMutationErrorEffect(setError, mutationErrors)

  return (
    <>
      <Prompt
        when={
          !isSubmitting && Object.keys(dirtyFields).length > 0
        }
        message="There are unsaved changes, are you sure you want to leave?"
      />
      <div>
        <SectionTitle>PrecisionFDA Challenge Inquiry</SectionTitle>
        <p>Please complete this form for your new challenge proposal. Thank you!</p>
        <StyledForm onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <FieldGroup>
            <label>Name (required):</label>
            <InputText
              placeholder="Enter your name"
              {...register('name')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="name"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup>
            <label>Contact email:</label>
            <InputText
              placeholder="Enter your contact email"
              {...register('email')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="email"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>
          <FieldGroup>
            <label>Organisation / Institute:</label>
            <InputText
              placeholder="Enter your organisation / institute"
              {...register('organisation')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="organisation"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>


          <FieldGroup >
            <label>Do you have specific scientific question driving the challenge?</label>
            <Controller
              name="specific_question"
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <RadioButtonGroup
                  name="specific_question"
                  ariaLabel='challenge-question'
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' }
                  ]}
                />
              )}
            />
            <ErrorMessage
              errors={errors}
              name="specific_question"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup>
            <label>Please provide question details:</label>
            <InputText
              type="textarea"
              disabled={hasQuestion === 'No'}
              placeholder="Enter the question details"
              {...register('specific_question_text')}
            />
            <ErrorMessage
              errors={errors}
              name="specific_question_text"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup >
            <label>Do you have access to data for the challenge?</label>
            <Controller
              name="data_details"
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <RadioButtonGroup
                  name="data_details"
                  ariaLabel='data-details'
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' }
                  ]}
                />
              )}
            />
            <ErrorMessage
              errors={errors}
              name="data_details"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup>
            <label>Please provide details about the data (e.g. data type, sample number, etc):</label>
            <InputText
              type="textarea"
              disabled={hasData === 'No'}
              placeholder="Enter the data details"
              {...register('data_details_text')}
            />
            <ErrorMessage
              errors={errors}
              name="data_details_text"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <Row>
            <ButtonSolidBlue
              disabled={Object.keys(errors).length > 0 || isSubmitting}
              type="submit"
            >
              Submit Inquiry
            </ButtonSolidBlue>
            {isSubmitting && <Loader />}
          </Row>
        </StyledForm>
      </div>

    </>
  )
}
