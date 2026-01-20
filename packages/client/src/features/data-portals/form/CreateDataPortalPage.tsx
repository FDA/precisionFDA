import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React from 'react'
import { useNavigate } from 'react-router'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { ApiErrorResponse } from '../../home/types'
import { StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { createDataPortalRequest } from '../api'
import { CreateDataPortalData } from '../types'
import { CreateDataPortalForm, DataPortalForm } from './DataPortalForm'

const CreateDataPortalPage = () => {
  const navigate = useNavigate()
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const dataPortalMutation = useMutation({
    mutationFn: createDataPortalRequest,
    onSuccess: async res => {
      if ([res.guestLeadDxuser, res.hostLeadDxuser].includes(user?.dxuser ?? '')) {
        navigate(`/data-portals/${res.urlSlug}`)
      } else {
        navigate('/data-portals')
      }
      toastSuccess('Data Portal created')
      queryClient.invalidateQueries({
        queryKey: ['data-portal-list'],
      })
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message = error.response?.data?.error?.message || error.message || 'Unknown error'
      toastError(`Error while creating data portal: ${message}`)
    },
  })

  const onSubmit = async (v: CreateDataPortalForm) => {
    const payload = {
      dataPortal: {
        name: v.name,
        description: v.description,
        urlSlug: v.urlSlug,
        cardImageFileName: v.cardImageFile?.[0]?.name,
        hostLeadDxUser: v.hostLeadDxuser?.value,
        guestLeadDxUser: v.guestLeadDxuser?.value,
        sortOrder: Number(v.sortOrder),
      },
      image: v.cardImageFile?.[0],
    } as CreateDataPortalData

    dataPortalMutation.mutate(payload)
  }

  return (
    <UserLayout mainScroll>
      <StyledPageCenter>
        <StyledPageContent>
          <BackLinkMargin linkTo="/data-portals">Back to Data Portals</BackLinkMargin>
        </StyledPageContent>
      </StyledPageCenter>
      {user?.isAdmin ? (
        <StyledPageCenter>
          <StyledPageContent>
            <PageTitle>Create a Data Portal</PageTitle>
            <DataPortalForm onSubmit={onSubmit} canEditMainDataPortal isSubmitting={dataPortalMutation.isPending} />
          </StyledPageContent>
        </StyledPageCenter>
      ) : (
        <NotAllowedPage />
      )}
    </UserLayout>
  )
}

export default CreateDataPortalPage
