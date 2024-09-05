import React from 'react'
import { useNavigate } from 'react-router-dom'
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


const CreateDataPortalPage = () => {
  const navigate = useNavigate()
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const dataPortalMutation = useMutation({ mutationFn: createDataPortalRequest })

  const onSubmit = async (v: any) => {
    const payload = {
      dataPortal: {
        name: v.name,
        description: v.description,
        url_slug: v.url_slug,
        card_image_file_name: v.card_image_file[0]?.name,
        status: v.status?.value,
        host_lead_dxuser: v.host_lead_dxuser?.value,
        guest_lead_dxuser: v.guest_lead_dxuser?.value,
        sort_order: v.sort_order,
      },
      image: v.card_image_file[0],
    } as CreateDataPortalData

    try {
      const res = await dataPortalMutation.mutateAsync(payload)
      navigate(`/data-portals/${res.urlSlug}`)
      queryClient.invalidateQueries({
        queryKey: ['data-portal-list'],
      })
      toast.success('Data Portal created')
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message || 'Unknown error'
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
