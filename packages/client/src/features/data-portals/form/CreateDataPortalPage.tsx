import React from 'react'
import { useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { PageTitle } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { createDataPortalRequest } from '../api'
import { CreateDataPortalData } from '../types'
import { DataPortalForm } from './DataPortalForm'
import { AxiosError } from 'axios'
import { ApiErrorResponse } from '../../home/types'

interface DataPortalFormData {
  name: string
  description: string
  url_slug: string
  sort_order: number
  card_image_file: File[] | null
  host_lead_dxuser: SelectItem | null
  guest_lead_dxuser: SelectItem | null
}

interface SelectItem {
  value: string
}

const CreateDataPortalPage = () => {
  const navigate = useNavigate()
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const dataPortalMutation = useMutation({ mutationFn: createDataPortalRequest })

  const onSubmit = async (v: DataPortalFormData) => {
    const payload = {
      dataPortal: {
        name: v.name,
        description: v.description,
        urlSlug: v.url_slug,
        cardImageFileName: v.card_image_file?.[0]?.name,
        hostLeadDxUser: v.host_lead_dxuser?.value,
        guestLeadDxUser: v.guest_lead_dxuser?.value,
        sortOrder: Number(v.sort_order),
      },
      image: v.card_image_file?.[0],
    } as CreateDataPortalData

    try {
      const res = await dataPortalMutation.mutateAsync(payload)
      navigate(`/data-portals/${res.urlSlug}`)
      queryClient.invalidateQueries({
        queryKey: ['data-portal-list'],
      })
      toast.success('Data Portal created')
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>
      const message = error.response?.data?.error?.message || error.message || 'Unknown error'
      toast.error(`Error while creating data portal: ${message}`)
    }
  }

  return (
    <UserLayout mainScroll>
      <StyledPageCenter>
        <StyledPageContent>
          <BackLinkMargin linkTo="/data-portals">
            Back to Data Portals
          </BackLinkMargin>
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
