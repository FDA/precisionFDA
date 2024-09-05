/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { cleanObject } from '../../../utils/object'
import { CreateAppPayload, CreateAppResponse, createEditAppRequest } from '../apps.api'
import { AppForm } from './AppForm'

export const CreateAppPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // There used to be an approach to write error handling logic into useMutation onError callback, but the problem is
  // the onError callback won't stop Error propagation, therefore there has to be a catch clause anyway (as can be seen few lines bellow)
  const appMutation = useMutation({ mutationFn: createEditAppRequest })

  const onSubmit = async (d: CreateAppPayload) => {
    const vals = { ...d, input_spec: d.input_spec.map(i => cleanObject(i)) }

    try {
      const res: CreateAppResponse = await appMutation.mutateAsync(vals)
      navigate(`/home/apps/${res.id}`)
      queryClient.invalidateQueries({
        queryKey: ['apps'],
      })
      queryClient.invalidateQueries({
        queryKey: ['counters'],
      })
      toast.success('Your app was created successfully')
    } catch (err) {
      // The default error message choice is an error we "intentionally" send from the backend
      // The second choice is a standard Error object message
      // The 'Unknown error' is a fallback in case the previous options provide nothing better than - for example - an empty string
      const message = err.response?.data?.error?.message || err.message || 'Unknown error'
      toast.error(`Error while creating app: ${message}`)
    }
  }

  return <AppForm onSubmit={onSubmit} isSubmitting={appMutation.isPending}/>
}
