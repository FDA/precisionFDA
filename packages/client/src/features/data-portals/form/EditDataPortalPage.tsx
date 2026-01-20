import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React from 'react'
import { useNavigate, useParams } from 'react-router'
import { Loader } from '../../../components/Loader'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { ApiErrorResponse } from '../../home/types'
import { StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { editDataPortalRequest, UpdateDataPortalRequest } from '../api'
import { useDataPortalByIdQuery } from '../queries'
import { UpdateDataPortalData } from '../types'
import { canEditSettings, isUserInMemberRole } from '../utils'
import { CreateDataPortalForm, DataPortalForm } from './DataPortalForm'

const EditDataPortalPage = () => {
  const { portalId } = useParams<{ portalId: string }>()
  const { data: portal, isLoading } = useDataPortalByIdQuery(portalId!)
  const navigate = useNavigate()
  const user = useAuthUser()
  const queryClient = useQueryClient()

  const dataPortalMutation = useMutation({ mutationFn: editDataPortalRequest })

  const onSubmit = async (v: CreateDataPortalForm) => {
    const payload: UpdateDataPortalData = {
      dataPortal: {
        id: portal?.id,
        name: v.name,
        description: v.description,
        sortOrder: v.sortOrder,
      } as UpdateDataPortalRequest,
      spaceId: v.cardImageFile ? portal?.spaceId : undefined,
      image: v.cardImageFile ? v.cardImageFile[0] : undefined,
    }

    try {
      await dataPortalMutation.mutateAsync(payload)
      queryClient.invalidateQueries({
        queryKey: ['data-portal-list'],
      })

      const navigateToUrl: string = portal !== undefined ? `/data-portals/${portal.urlSlug}` : '/data-portals/'
      navigate(navigateToUrl)

      toastSuccess('Data Portal updated')
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>
      const message = error.response?.data?.error?.message || error.message || 'Unknown error'
      toastError(`Error while editing data portal: ${message}`)
    }
  }

  if (isLoading || !portal) {
    return <Loader />
  }

  return (
    <UserLayout mainScroll>
      <StyledPageCenter>
        <StyledPageContent>
          <BackLinkMargin linkTo={`/data-portals/${portal.urlSlug}`}>Back to Data Portal</BackLinkMargin>
        </StyledPageContent>
      </StyledPageCenter>
      {canEditSettings(user?.dxuser, portal.members) ? (
        <StyledPageCenter>
          <StyledPageContent>
            <PageTitle>Edit Data Portal</PageTitle>
            <DataPortalForm
              isEditMode
              mutationErrors={dataPortalMutation.error as AxiosError<ApiErrorResponse> | null}
              canEditMainDataPortal={user?.admin && isUserInMemberRole(user?.dxuser, portal?.members, ['lead'])}
              onSubmit={onSubmit}
              isSubmitting={dataPortalMutation.isPending}
              defaultValues={{
                ...portal,
                cardImageFile: null,
                hostLeadDxuser: {
                  label: portal.hostLeadDxuser,
                  value: portal.hostLeadDxuser,
                },
                guestLeadDxuser: {
                  label: portal.guestLeadDxuser,
                  value: portal.guestLeadDxuser,
                },
              }}
            />
          </StyledPageContent>
        </StyledPageCenter>
      ) : (
        <NotAllowedPage />
      )}
    </UserLayout>
  )
}

export default EditDataPortalPage
