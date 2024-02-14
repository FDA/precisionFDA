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
import { CreateDataPortalRequest, createDataPortalRequest } from '../api'
import { DataPortal, CreateDataPortalData } from '../types'
import { DataPortalForm } from './DataPortalForm'
import { ScrollableMainGlobalStyles } from '../../../styles/global'


const CreateDataPortalPage = () => {
  const navigate = useNavigate()
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['create-data-portal'],
    mutationFn: (payload: CreateDataPortalData) => createDataPortalRequest(payload),
    onSuccess: res => {
      if (!res?.error) {
        queryClient.invalidateQueries({
          queryKey: ['data-portal-list'],
        })
        navigate(`/data-portals/${res.id}`)
        toast.success('Data Portal created')
      } else if (res?.error) {
        toast.error(`${res.error.type}: ${res.error.message}`)
      } else {
        toast.error('Something went wrong')
      }
    },
    onError: () => {
      toast.error('There was an issue creating the data portal')
    },
  })

  const handleSubmit = async (v: any) => {
    return mutation.mutateAsync(
      {
        dataPortal: {
          name: v.name,
          description: v.description,
          card_image_file_name: v.card_image_file[0]?.name,
          default: v.default,
          status: v.status?.value,
          host_lead_dxuser: v.host_lead_dxuser?.value,
          guest_lead_dxuser: v.guest_lead_dxuser?.value,
        },
      image: v.card_image_file[0],
    })
  }

  return (
    <>
      <ScrollableMainGlobalStyles />
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
              <DataPortalForm onSubmit={handleSubmit} canEditMainDataPortal />
            </StyledPageContent>
          </StyledPageCenter>
        ) : (
          <NotAllowedPage />
          )}

      </UserLayout>
      </>
  )
}

export default CreateDataPortalPage
