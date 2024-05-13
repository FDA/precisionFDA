import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CreateAppPayload, CreateAppResponse, createEditAppRequest } from '../apps.api'
import { AppForm } from './AppForm'
import { Loader } from '../../../components/Loader'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { cleanObject } from '../../../utils/object'
import { useFetchAppQuery } from '../useFetchAppQuery'
import { mapFromServerToForm } from './common'
import { getBasePath } from '../../home/utils'

export const ForkAppPage = ({ spaceId }: { spaceId?: number }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { appUid } = useParams<{ appUid: string }>()

  const { data, isLoading, isError } = useFetchAppQuery(appUid)

  const appMutation = useMutation({ mutationFn: createEditAppRequest })

  const onSubmit = async (d: CreateAppPayload) => {
    const vals = { ...d, input_spec: d.input_spec.map(i => cleanObject(i)) }

    try {
      const res: CreateAppResponse = await appMutation.mutateAsync(vals)
      navigate(`${getBasePath(spaceId)}/apps/${res?.id}`)
      queryClient.invalidateQueries({
        queryKey: ['apps', 'app'],
      })
      toast.success('App forked successfully')
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message || 'Unknown error'
      toast.error(`Error while forking app: ${message}`)
    }
  }

  if (isLoading) return <Loader className="pageloader" />
  if (isError && !data) return <NotAllowedPage />

  return (
    <AppForm
      isFork
      onSubmit={onSubmit}
      app={data.app}
      isSubmitting={appMutation.isPending}
      defaultVals={{
        is_new: true,
        name: data.app.name,
        title: data.app.title,
        readme: data.app.readme,
        forked_from: data.app.uid,
        instance_type: data.meta.spec.instance_type,
        internet_access: data.meta.spec.internet_access,
        release: data.meta.release || '20.04',
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
