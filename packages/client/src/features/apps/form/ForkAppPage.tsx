import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { Loader } from '../../../components/Loader'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { APP_REVISION_CREATION_NOT_REQUESTED, APP_SERIES_CREATION_NOT_REQUESTED } from '../../../constants'
import { cleanObject } from '../../../utils/object'
import { ApiErrorResponse, ServerScope } from '../../home/types'
import { getBasePath } from '../../home/utils'
import { CreateAppPayload, CreateAppResponse, createEditAppRequest } from '../apps.api'
import { useFetchAppQuery } from '../useFetchAppQuery'
import { AppForm } from './AppForm'
import { mapFromServerToForm } from './common'
import { AxiosError } from 'axios'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

export const ForkAppPage = ({ spaceId }: { spaceId?: number }) => {
  const location = useLocation()
  const { targetScope, targetName } = location.state || {}

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { appUid } = useParams<{ appUid: string }>()

  const { data, isLoading, isError } = useFetchAppQuery(appUid!)

  const appMutation = useMutation({ mutationFn: createEditAppRequest })

  const onSubmit = async (d: CreateAppPayload) => {
    d.createAppSeries = true
    const vals = { ...d, input_spec: d.input_spec.map(i => cleanObject(i)) }

    try {
      const res: CreateAppResponse = await appMutation.mutateAsync(vals)
      navigate(`${getBasePath(spaceId)}/apps/${res?.uid}`)
      queryClient.invalidateQueries({
        queryKey: ['apps', 'app'],
      })
      toastSuccess('App forked successfully')
    } catch (err: unknown) {
      const errorWithResponse = err as AxiosError<ApiErrorResponse>
      const message = errorWithResponse.response?.data?.error?.message || errorWithResponse.message || 'Unknown error'
      if (
        errorWithResponse.response?.status === 400 &&
        errorWithResponse?.response?.data?.error?.code &&
        [APP_SERIES_CREATION_NOT_REQUESTED, APP_REVISION_CREATION_NOT_REQUESTED].includes(
          errorWithResponse.response.data.error.code,
        )
      ) {
        throw err
      } else {
        toastError(`Error while forking app: ${message}`)
      }
    }
  }

  if (isLoading) return <Loader className="pageloader" />
  if (isError && !data) return <NotAllowedPage />
  if (!data) return null

  return (
    <AppForm
      isFork={true}
      onSubmit={onSubmit}
      app={data.app}
      isSubmitting={appMutation.isPending}
      targetScopeName={targetName}
      defaultVals={{
        is_new: true,
        name: data.app.name,
        title: data.app.title,
        readme: data.app.readme,
        forked_from: data.app.uid,
        instance_type: data.meta.spec.instance_type,
        internet_access: data.meta.spec.internet_access,
        release: data.meta.release || '20.04',
        scope: (targetScope as ServerScope) || 'private',
        ordered_assets: data?.meta?.assets || [],
        code: data.meta?.internal?.code || '',
        packages: data.meta?.internal?.packages || [],
        input_spec: data.meta?.spec?.input_spec.map(mapFromServerToForm) || [],
        output_spec: data.meta?.spec?.output_spec || [],
        createAppRevision: false,
        createAppSeries: false,
      }}
    />
  )
}
