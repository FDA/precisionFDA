import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useHistory, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { Loader } from '../../../components/Loader'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { editDataPortalRequest } from '../api'
import { useDataPortalByIdQuery } from '../queries'
import { DataPortalForm } from './DataPortalForm'

const EditDataPortalPage = () => {
  const { portalId } = useParams<{ portalId: string }>()
  const { data: portal, isLoading } = useDataPortalByIdQuery(portalId)
  const history = useHistory()
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['update-data-portal'],
    mutationFn: (payload: any) => editDataPortalRequest(payload, portal.id),
    onSuccess: res => {
      if (!res?.error) {
        queryClient.invalidateQueries(['data-portal-list'])
        history.push('/data-portals')
        toast.success('Data Portal updated')
      } else if (res?.error) {
        toast.error(`${res.error.type}: ${res.error.message}`)
      } else {
        toast.error('Something went wrong!')
      }
    },
    onError: () => {
      toast.error('There was an issue updating the data portal.')
    },
  })

  const handleSubmit = async (v: any) => {
    return mutation.mutateAsync({
      name: v.name,
      description: v.description,
      app_owner_id: v.app_owner_id?.value,
      status: v.status?.value,
      host_lead_dxuser: v.host_lead_dxuser?.value,
      guest_lead_dxuser: v.guest_lead_dxuser?.value,
      image: v.card_image_file[0],
    })
  }

  if (!portal && isLoading) {
    return <Loader />
  }

  return (
    <UserLayout>
      <StyledPageCenter>
      <StyledPageContent>

        <BackLinkMargin linkTo={`/data-portals/${portal.id}`}>
          Back to Data Portal
        </BackLinkMargin>
      </StyledPageContent>
      </StyledPageCenter>
      {user?.isAdmin ? (
        <StyledPageCenter>
          <StyledPageContent>
            <PageTitle>Edit Data Portal</PageTitle>
            <DataPortalForm
              onSubmit={handleSubmit}
              defaultValues={{
                name: portal?.name,
                description: portal?.description,
                card_image_uid: portal?.cardImageUid,
                card_image_url: portal?.cardImageUrl,
                host_lead_dxuser: {
                  label: portal?.hostLeadDxuser,
                  value: portal?.hostLeadDxuser,
                },
                guest_lead_dxuser: {
                  label: portal?.guestLeadDxuser,
                  value: portal?.guestLeadDxuser,
                },
                sort_order: portal?.sortOrder,
                status: { label: portal?.status, value: portal?.status },
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
