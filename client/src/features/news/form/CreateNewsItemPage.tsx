import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'
import { BackLink } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { AdminWrapper } from '../../admin/AdminWrapper'
import { createNewsItemRequest } from '../api'
import { CreateNewsForm, NewsItemForm } from './NewsItemForm'
import { FormPageContainer } from './styles'

const CreateNewsItemPage = () => {
  const history = useHistory()
  const queryClient = useQueryClient()
  const createNewsItemMutation = useMutation({
    mutationKey: ['create-news-item'],
    mutationFn: (payload: any) => createNewsItemRequest(payload),
    onSuccess: res => {
      history.push('/admin/news')
      queryClient.invalidateQueries(['news'])
      toast.success('Created news item')
    },
    onError: () => {
      toast.error('Error: Adding news item.')
    },
  })

  const handleSubmit = (vals: CreateNewsForm) => {
    createNewsItemMutation.mutateAsync(vals)
  }

  return (
    <UserLayout>
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
