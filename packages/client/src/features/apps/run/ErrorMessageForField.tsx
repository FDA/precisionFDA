import React from 'react'
import { ErrorMessage } from '@hookform/error-message'
import { FieldErrors } from 'react-hook-form'
import { InputError } from '../../../components/form/styles'

export const ErrorMessageForField = ({ errors, fieldName }:
  { errors: FieldErrors, fieldName: string }) =>
(
  <ErrorMessage
    errors={errors}
    name={fieldName}
    render={({ message }) =>
      <InputError>{message}</InputError>} />)