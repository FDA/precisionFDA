import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader } from '../../../components/Loader'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { cleanObject } from '../../../utils/object'
import { CreateAppPayload, CreateAppResponse, createEditAppRequest } from '../apps.api'
import { useFetchAppQuery } from '../useFetchAppQuery'
import { AppForm } from './AppForm'
import { mapFromServerToForm } from './common'
import { getBasePath } from '../../home/utils'


export const EditAppPage = ({ spaceId }: { spaceId?: string }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { appUid } = useParams<{ appUid: string }>()

  const { data, isError, isLoading } = useFetchAppQuery(appUid)

  const appMutation = useMutation({ mutationFn: createEditAppRequest })

  const onSubmit = async (d: CreateAppPayload) => {
    const vals = { ...d, input_spec: d.input_spec.map(i => cleanObject(i)) }

    try {
      const res: CreateAppResponse = await appMutation.mutateAsync(vals)
      navigate(`${getBasePath(spaceId)}/apps/${res?.id}`)
      queryClient.invalidateQueries({
        queryKey: ['apps', 'app'],
      })
      toast.success('New revision created')
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message || 'Unknown error'
      toast.error(`Error while editing app: ${message}`)
    }
  }


  if (isLoading) return <Loader className="pageloader" />
  if (isError && !data) return <NotAllowedPage />

  return (
    <AppForm
      isEdit
      onSubmit={onSubmit}
      app={data.app}
      isSubmitting={appMutation.isPending}
      defaultVals={{
        is_new: false,
        name: data.app.name,
        title: data.app.title,
        readme: data.app.readme,
        forked_from: data.app.forked_from,
        instance_type: data.meta.spec.instance_type,
        internet_access: data.meta.spec.internet_access,
        release: data.meta.release || '20.04',
        scope: data.app.scope,
        ordered_assets: data?.meta?.assets || [],
        code: data.meta?.internal?.code || '',
        packages: data.meta?.internal?.packages || [],
        input_spec: data.meta?.spec?.input_spec.map(mapFromServerToForm) || [],
        output_spec: data.meta?.spec?.output_spec || [],
      }}
    />
  )
}
