import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BackLink } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { AdminWrapper } from '../../admin/AdminWrapper'
import { createNewsItemRequest } from '../api'
import { CreateNewsForm, NewsItemForm } from './NewsItemForm'
import { FormPageContainer } from './styles'

const CreateNewsItemPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createNewsItemMutation = useMutation({
    mutationKey: ['create-news-item'],
    mutationFn: (payload: any) => createNewsItemRequest(payload),
    onSuccess: res => {
      navigate('/admin/news')
      queryClient.invalidateQueries({
        queryKey: ['news'],
      })
      toast.success('Created news item')
    },
    onError: () => {
      toast.error('Error: Adding news item')
    },
  })

  const handleSubmit = (vals: CreateNewsForm) => {
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
