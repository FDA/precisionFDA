import React from 'react'
import { useHistory } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { PageTitle } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { StyledPageCenter, StyledPageContent } from '../../spaces/form/styles'
import { createDataPortalRequest } from '../api'
import { DataPortalForm } from './DataPortalForm'

const CreateDataPortalPage = () => {
  const history = useHistory()
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['create-data-portal'],
    mutationFn: (payload: any) => createDataPortalRequest(payload),
    onSuccess: res => {
      if (!res?.error) {
        queryClient.invalidateQueries(['data-portal-list'])
        history.push('/data-portals')
        toast.success('Data Portal created')
      } else if (res?.error) {
        toast.error(`${res.error.type}: ${res.error.message}`)
      } else {
        toast.error('Something went wrong!')
      }
    },
    onError: () => {
      toast.error('There was an issue creating the data portal.')
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

  return (
    <UserLayout>
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
            <DataPortalForm onSubmit={handleSubmit} />
          </StyledPageContent>
        </StyledPageCenter>
      ) : (
        <NotAllowedPage />
      )}
    </UserLayout>
  )
}

export default CreateDataPortalPage
