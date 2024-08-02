import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader } from '../../../components/Loader'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { editDataPortalRequest, UpdateDataPortalRequest } from '../api'
import { useDataPortalByIdQuery } from '../queries'
import { UpdateDataPortalData } from '../types'
import { canEditSettings, isUserInMemberRole } from '../utils'
import { CreateDataPortalForm, DataPortalForm } from './DataPortalForm'

const EditDataPortalPage = () => {
  const { portalId } = useParams<{ portalId: string }>()
  const { data: portal, isLoading } = useDataPortalByIdQuery(portalId)
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
        sort_order: v.sort_order,
        status: v.status?.value,
      } as UpdateDataPortalRequest,
      spaceId: v.card_image_file ? portal?.spaceId : undefined,
      image: v.card_image_file ? v.card_image_file[0] : undefined,
    }

    try {
      await dataPortalMutation.mutateAsync(payload)
      queryClient.invalidateQueries({
        queryKey: ['data-portal-list'],
      })

      const navigateToUrl: string = portal !== undefined ? `/data-portals/${portal.urlSlug}` : '/data-portals/'
      navigate(navigateToUrl)

      toast.success('Data Portal updated')
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message || 'Unknown error'
      toast.error(`Error while editing data portal: ${message}`)
    }
  }

  if (isLoading || !portal) {
    return <Loader />
  }

  return (
    <UserLayout mainScroll>
      <StyledPageCenter>
      <StyledPageContent>

        <BackLinkMargin linkTo={`/data-portals/${portal.urlSlug}`}>
          Back to Data Portal
        </BackLinkMargin>
      </StyledPageContent>
      </StyledPageCenter>
      {canEditSettings(user?.dxuser, portal.members) ? (
        <StyledPageCenter>
          <StyledPageContent>
            <PageTitle>Edit Data Portal</PageTitle>
            <DataPortalForm
              isEditMode
              mutationErrors={dataPortalMutation.error as any}
              canEditMainDataPortal={user?.admin && isUserInMemberRole(user?.dxuser, portal?.members, ['lead'])}
              onSubmit={onSubmit}
              isSubmitting={dataPortalMutation.isPending}
              defaultValues={{
                name: portal.name,
                url_slug: portal.urlSlug,
                description: portal.description,
                card_image_uid: portal.cardImageUid,
                card_image_url: portal.cardImageUrl,
                card_image_file: null,
                host_lead_dxuser: {
                  label: portal.hostLeadDxuser,
                  value: portal.hostLeadDxuser,
                },
                guest_lead_dxuser: {
                  label: portal.guestLeadDxuser,
                  value: portal.guestLeadDxuser,
                },
                sort_order: portal.sortOrder,
                status: { label: portal.status, value: portal.status },
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
