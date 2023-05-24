/* eslint-disable no-nested-ternary */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useHistory, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { Loader } from '../../../components/Loader'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { AdminWrapper } from '../../admin/AdminWrapper'
import { deleteNewsItemRequest, editNewsItemRequest, newsItemRequest } from '../api'
import { NewsItem } from '../types'
import { CreateNewsForm, NewsItemForm } from './NewsItemForm'
import { FormPageContainer } from './styles'

const useNewsItemRequest = (id: string) => {
  return useQuery({
    queryKey: ['news-item', id],
    queryFn: () => newsItemRequest(id),
  })
}

const EditNewsItemMutation = ({ data }: { data: NewsItem }) => {
  const history = useHistory()
  const queryClient = useQueryClient()
  const editNewsItemMutation = useMutation({
    mutationKey: ['edit-news-item'],
    mutationFn: (payload: any) => editNewsItemRequest(data.id, payload),
    onSuccess: res => {
      history.push('/admin/news')
      queryClient.invalidateQueries(['news'])
      queryClient.invalidateQueries(['news-item'])
      toast.success('Edited news item')
    },
    onError: () => {
      toast.error('Error: Adding news item.')
    },
  })

  const deleteNewsItemMutation = useMutation({
    mutationKey: ['delete-news-item'],
    mutationFn: () => deleteNewsItemRequest(data.id),
    onSuccess: res => {
      history.push('/admin/news')
      queryClient.invalidateQueries(['news-item'])
      queryClient.invalidateQueries(['news'])
      toast.success('Deleted news item')
    },
    onError: () => {
      toast.error('Error: deleting news item.')
    },
  })

  const handleSubmit = (vals: CreateNewsForm) => {
    editNewsItemMutation.mutateAsync(vals)
  }
  const handleDelete = () => {
    if (window.confirm('Are you sure you wish to delete this item?')) deleteNewsItemMutation.mutateAsync()
  }

  const tData = { ...data, createdAt: new Date(data.createdAt).toISOString().substring(0,10) } satisfies NewsItem

  return <NewsItemForm onSubmit={handleSubmit} onDelete={handleDelete} defaultValues={tData} />
}

const EditNewsItemPage = () => {
  const { id: idParam } = useParams<{ id: string }>()
  const { data, isLoading } = useNewsItemRequest(idParam)

  return (
    <UserLayout>
      <AdminWrapper>
        <FormPageContainer>
          <BackLinkMargin linkTo="/admin/news">Back to admin news list</BackLinkMargin>
          <PageTitle>Edit news item</PageTitle>
          {isLoading ? (
            <Loader />
          ) : data ? (
            <EditNewsItemMutation data={data} />
          ) : (
            <div>News item not found.</div>
          )}
        </FormPageContainer>
      </AdminWrapper>
    </UserLayout>
  )
}

export default EditNewsItemPage
