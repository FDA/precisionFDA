import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate } from 'react-router'
import { BackLink } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { AdminWrapper } from '../../admin/AdminWrapper'
import { createNewsItemRequest } from '../api'
import { NewsItemPayload } from '../types'
import { NewsItemForm } from './NewsItemForm'
import { FormPageContainer } from './styles'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

const CreateNewsItemPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createNewsItemMutation = useMutation({
    mutationKey: ['create-news-item'],
    mutationFn: (payload: NewsItemPayload) => createNewsItemRequest(payload),
    onSuccess: () => {
      navigate('/admin/news')
      queryClient.invalidateQueries({
        queryKey: ['news'],
      })
      toastSuccess('Successfully created news item')
    },
    onError: () => {
      toastError('Error: Adding news item')
    },
  })

  const handleSubmit = (vals: NewsItemPayload) => {
    createNewsItemMutation.mutateAsync(vals)
  }

  return (
    <UserLayout mainScroll>
      <AdminWrapper>
        <FormPageContainer>
          <BackLink linkTo="/admin/news">Back to admin news list</BackLink>
          <PageTitle>Create a news item</PageTitle>
          <NewsItemForm onSubmit={handleSubmit} />
        </FormPageContainer>
      </AdminWrapper>
    </UserLayout>
  )
}

export default CreateNewsItemPage
