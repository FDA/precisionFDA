/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { cleanObject } from '../../../../utils/object'
import { createEditAppRequest } from '../apps.api'
import { CreateAppForm } from '../apps.types'
import { AppForm } from './AppForm'


export const CreateAppPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createAppMutation = useMutation({
    mutationKey: ['create-app'],
    mutationFn: (payload: any) => createEditAppRequest(payload),
    onSuccess: res => {
      if (res?.id) {
        navigate(`/home/apps/${res?.id}`)
        queryClient.invalidateQueries(['apps'])
        queryClient.invalidateQueries(['counters'])
        toast.success('Your app was created successfully')
      } else if (res?.error) {
        toast.error(`${res.error.type}: ${res.error.message}`)
      } else {
        toast.error('Something went wrong!')
      }
    },
    onError: () => {
      toast.error('There was an error creating your app')
    },
  })

  const onSubmit = (d: CreateAppForm) => {
    const vals = { ...d, input_spec: d.input_spec.map(i => cleanObject(i)) }
    return createAppMutation.mutateAsync(vals)
  }

  return <AppForm onSubmit={onSubmit} />
}
