import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useHistory, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { CreateAppPayload, createEditAppRequest } from '../apps.api'
import { AppForm } from './AppForm'
import { Loader } from '../../../../components/Loader'
import { NotAllowedPage } from '../../../../components/NotAllowed'
import { cleanObject } from '../../../../utils/object'
import { useFetchAppQuery } from '../useFetchAppQuery'
import { mapFromServerToForm } from './common'
import { getBasePath } from '../../utils'

export const ForkAppPage = ({ spaceId }: { spaceId: number }) => {
  const history = useHistory()
  const queryClient = useQueryClient()
  const { appUid } = useParams<{ appUid: string }>()

  const { data, isLoading, isError } = useFetchAppQuery(appUid)

  const createAppMutation = useMutation({
    mutationKey: ['edit-app'],
    mutationFn: (payload: any) => createEditAppRequest(payload),
    onSuccess: res => {
      if (res?.id) {
        history.push(`${getBasePath(spaceId)}/apps/${res?.id}`)
        queryClient.invalidateQueries(['apps', 'app'])
        toast.success('Forked app')
      } else if (res?.error) {
        toast.error(`${res.error.type}: ${res.error.message}`)
      } else {
        toast.error('Something went wrong!')
      }
    },
    onError: () => {
      toast.error('There was a problem forking app.')
    },
  })

  const onSubmit = (d: CreateAppPayload) => {
    const vals = { ...d, input_spec: d.input_spec.map(i => cleanObject(i)) }
    return createAppMutation.mutateAsync(vals)
  }

  if (isLoading) return <Loader className="pageloader" />
  if (isError && !data) return <NotAllowedPage />

  return (
    <AppForm
      isFork
      onSubmit={onSubmit}
      app={data.app}
      defaultVals={{
        is_new: true,
        name: data.app.name,
        title: data.app.title,
        readme: data.app.readme,
        forked_from: data.app.uid,
        instance_type: data.meta.spec.instance_type,
        internet_access: data.meta.spec.internet_access,
        release: data.meta.release || '16.04',
        scope: 'private',
        ordered_assets: data?.meta?.assets || [],
        code: data.meta?.internal?.code || '',
        packages: data.meta?.internal?.packages || [],
        input_spec: data.meta?.spec?.input_spec.map(mapFromServerToForm) || [],
        output_spec: data.meta?.spec?.output_spec || [],
      }}
    />
  )
}
