import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addDays } from 'date-fns/esm'
import { format } from 'date-fns-tz/esm'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { AlertBanner } from '../../../components/AlertBanner'
import { Button } from '../../../components/Button'
import { InputDateTime, InputText } from '../../../components/InputText'
import { FieldGroup, FieldLabel, InputError, InputSelect } from '../../../components/form/styles'
import { createAlertRequest, deleteAlertRequest, updateAlertRequest } from './alerts.api'
import { Form, FormPage, PreviewBanner, StyledRow } from './alerts.styles'
import { Alert, AlertType } from './alerts.types'
import { alertTypesArray, alertTypesText, formatInTimeZone, validationSchema } from './alerts.common'

type AlertFormType = {
  title: string
  content: string
  type: AlertType
  startTime: string
  endTime: string
}

function createDefault(i?: Alert) {
  return {
    content: i?.content ?? '',
    title: i?.title ?? '',
    startTime: format(i?.startTime ? new Date(i?.startTime) : new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(i?.endTime ? new Date(i?.endTime) : addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
    type: i?.type ?? 'info',
  } satisfies AlertFormType
}

const AlertForm = ({
  isNew,
  alertItem,
  onSubmit,
  onDelete,
}: {
  isNew?: boolean
  alertItem?: Alert
  onSubmit: (d: AlertFormType) => void
  onDelete: () => void
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AlertFormType>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: createDefault(alertItem),
  })

  useEffect(() => {
    reset(createDefault(alertItem))
  }, [alertItem])

  return (
    <FormPage>
      <PreviewBanner>
        <FieldLabel>Preview</FieldLabel>
        <AlertBanner variant={watch('type')} alertText={watch('content')} dismissAlert={() => {}} />
      </PreviewBanner>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <FieldLabel>Title</FieldLabel>
          <InputText {...register('title')} placeholder="Title" />
          <ErrorMessage errors={errors} name="title" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Content</FieldLabel>
          <InputText {...register('content')} placeholder="Content" />
          <ErrorMessage errors={errors} name="content" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Type</FieldLabel>
          <InputSelect {...register('type')}>
            {alertTypesArray
              .filter(a => a !== 'danger')
              .filter(a => a !== 'warning')
              .map(type => (
              <option key={type} value={type}>
                {alertTypesText[type]}
              </option>
            ))}
          </InputSelect>
          <ErrorMessage errors={errors} name="type" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Start Time</FieldLabel>
          <InputDateTime type="datetime-local" {...register('startTime')} />
          <ErrorMessage errors={errors} name="startTime" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>End Time</FieldLabel>
          <InputDateTime type="datetime-local" {...register('endTime')} />
          <ErrorMessage errors={errors} name="endTime" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>

        <StyledRow>
          <Button data-variant="primary" type="submit" disabled={isSubmitting || Object.keys(errors).length > 0}>
            Save Alert
          </Button>
          {!isNew && (
            <Button
              data-variant="warning"
              type="button"
              onClick={() => {
                onDelete()
              }}
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              Delete
            </Button>
          )}
        </StyledRow>
      </Form>
    </FormPage>
  )
}

export const EditAlertForm = ({
  onSuccess,
  isNew,
  alertItem,
}: {
  onSuccess: (id?: number) => void
  isNew: boolean
  alertItem?: Alert
}) => {
  const queryClient = useQueryClient()
  const createAlertMutation = useMutation({
    mutationKey: ['create-alert-item'],
    mutationFn: (payload: any) => createAlertRequest(payload),
    onSuccess: r => {
      queryClient.invalidateQueries({ queryKey: ['site-settings']})
      queryClient.invalidateQueries({ queryKey: ['alerts-list']})
      onSuccess(r)
      toast.success('Created site alert')
    },
    onError: () => {
      toast.error('Error: Adding site alert')
    },
  })

  const deleteAlertMutation = useMutation({
    mutationKey: ['delete-alert-item'],
    mutationFn: (payload: { id: number }) => deleteAlertRequest(payload.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts-list']})
      queryClient.invalidateQueries({ queryKey: ['site-settings']})
      onSuccess()
      toast.success('Removed site alert')
    },
    onError: () => {
      toast.error('Error: Adding site alert')
    },
  })

  const updateAlertMutation = useMutation({
    mutationKey: ['update-alert-item'],
    mutationFn: (payload: { id: number; vals: any }) => updateAlertRequest(payload.id, payload.vals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts-list']})
      queryClient.invalidateQueries({ queryKey: ['site-settings']})
      toast.success('Updated site alert')
    },
    onError: () => {
      toast.error('Error: Updating site alert')
    },
  })

  const handleSubmit = (vals: AlertFormType) => {
    vals.startTime = formatInTimeZone(vals.startTime, "yyyy-MM-dd'T'HH:mm", 'UTC')
    vals.endTime = formatInTimeZone(vals.endTime, "yyyy-MM-dd'T'HH:mm", 'UTC')

    if (isNew) return createAlertMutation.mutateAsync(vals)
    return updateAlertMutation.mutateAsync({ id: alertItem?.id, vals })
  }
  const handleDelete = (id: number) => {
    return deleteAlertMutation.mutateAsync({ id })
  }

  return (
    <AlertForm
      alertItem={alertItem}
      isNew={isNew}
      onSubmit={handleSubmit}
      onDelete={() => alertItem && handleDelete(alertItem.id)}
    />
  )
}
