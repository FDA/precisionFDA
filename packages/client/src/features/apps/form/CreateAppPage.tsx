import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate } from 'react-router'
import { APP_REVISION_CREATION_NOT_REQUESTED, APP_SERIES_CREATION_NOT_REQUESTED } from '../../../constants'
import { cleanObject } from '../../../utils/object'
import { CreateAppPayload, CreateAppResponse, createEditAppRequest } from '../apps.api'
import { AppForm } from './AppForm'
import { ApiErrorResponse } from '../../home/types'
import { AxiosError } from 'axios'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

export const CreateAppPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // There used to be an approach to write error handling logic into useMutation onError callback, but the problem is
  // the onError callback won't stop Error propagation, therefore there has to be a catch clause anyway (as can be seen few lines bellow)
  const appMutation = useMutation({ mutationFn: createEditAppRequest })

  const onSubmit = async (d: CreateAppPayload) => {
    d.createAppSeries = true
    const vals = { ...d, input_spec: d.input_spec.map(i => cleanObject(i)) }

    try {
      const res: CreateAppResponse = await appMutation.mutateAsync(vals)
      navigate(`/home/apps/${res.uid}`)
      queryClient.invalidateQueries({
        queryKey: ['apps'],
      })
      queryClient.invalidateQueries({
        queryKey: ['counters'],
      })
      toastSuccess('Your app was created successfully')
    } catch (err: unknown) {
      // The default error message choice is an error we "intentionally" send from the backend
      // The second choice is a standard Error object message
      // The 'Unknown error' is a fallback in case the previous options provide nothing better than - for example - an empty string
      const errorWithResponse = err as AxiosError<ApiErrorResponse>
      if (
        errorWithResponse.response?.status === 400 &&
        errorWithResponse?.response?.data?.error?.code &&
        [APP_SERIES_CREATION_NOT_REQUESTED, APP_REVISION_CREATION_NOT_REQUESTED].includes(
          errorWithResponse.response.data.error.code,
        )
      ) {
        throw err
      } else {
        const message = errorWithResponse.response?.data?.error?.message || (err as Error).message || 'Unknown error'
        toastError(`Error while creating app: ${message}`)
      }
    }
  }

  return <AppForm onSubmit={onSubmit} isSubmitting={appMutation.isPending} />
}
