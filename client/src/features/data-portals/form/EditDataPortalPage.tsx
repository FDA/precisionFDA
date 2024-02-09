import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseInt } from 'lodash'
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
import { ScrollableMainGlobalStyles } from '../../../styles/global'

const EditDataPortalPage = () => {
  const { portalId } = useParams<{ portalId: string }>()
  const { data: portal, isLoading } = useDataPortalByIdQuery(portalId)
  const navigate = useNavigate()
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['update-data-portal'],
    mutationFn: (payload: UpdateDataPortalData) => editDataPortalRequest(payload),
    onSuccess: res => {
      if (!res?.error) {
        queryClient.invalidateQueries(['data-portal-list'])
        navigate('/data-portals')
        toast.success('Data Portal updated')
      } else if (res?.error) {
        toast.error(`${res.error.type}: ${res.error.message}`)
      } else {
        toast.error('Something went wrong')
      }
    },
    onError: () => {
      toast.error('There was an issue updating the data portal')
    },
  })

  const handleSubmit = async (v: CreateDataPortalForm) => {
    const payload: UpdateDataPortalData = {
      dataPortal: {
        id: parseInt(portalId, 10),
        name: v.name,
        description: v.description,
        default: v.default,
        sort_order: v.sort_order,
        ...portal && { space_id: portal.spaceId },
      } as UpdateDataPortalRequest,
      image: v.card_image_file ? v.card_image_file[0] : null,
    }
    return mutation.mutateAsync(payload).catch(() => {})
  }

  if (isLoading || !portal) {
    return <Loader />
  }

  return (
    <>
    <ScrollableMainGlobalStyles />
    <UserLayout>
      <StyledPageCenter>
      <StyledPageContent>

        <BackLinkMargin linkTo={`/data-portals/${portal.id}`}>
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
              mutationErrors={mutation.error as any}
              canEditMainDataPortal={user?.admin && isUserInMemberRole(user?.dxuser, portal?.members, ['lead'])}
              onSubmit={handleSubmit}
              defaultValues={{
                name: portal.name,
                description: portal.description,
                default: portal.default,
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
    </>

  )
}

export default EditDataPortalPage
