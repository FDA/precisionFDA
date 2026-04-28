import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import { Loader } from '@/components/Loader'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { BackLinkMargin } from '@/components/Page/PageBackLink'
import { PageTitle } from '@/components/Page/styles'
import { AdminWrapper } from '../../admin/AdminWrapper'
import { deleteNewsItemRequest, editNewsItemRequest, newsItemRequest } from '../api'
import { NewsItem, NewsItemPayload } from '../types'
import { NewsItemForm } from './NewsItemForm'
import { FormPageContainer } from './styles'

const useNewsItemRequest = (id: string) => {
  return useQuery({
    queryKey: ['news-item', id],
    queryFn: () => newsItemRequest(id),
  })
}

const EditNewsItemMutation = ({ data }: { data: NewsItem }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const editNewsItemMutation = useMutation({
    mutationKey: ['edit-news-item'],
    mutationFn: (payload: NewsItemPayload) => editNewsItemRequest(data.id, payload),
    onSuccess: () => {
      navigate('/account/admin/news')
      queryClient.invalidateQueries({
        queryKey: ['news'],
      })
      queryClient.invalidateQueries({
        queryKey: ['news-item'],
      })
      toastSuccess('Successfully edited news item')
    },
    onError: () => {
      toastError('Error: Adding news item')
    },
  })

  const deleteNewsItemMutation = useMutation({
    mutationKey: ['delete-news-item'],
    mutationFn: () => deleteNewsItemRequest(data.id),
    onSuccess: () => {
      navigate('/account/admin/news')
      queryClient.invalidateQueries({
        queryKey: ['news-item'],
      })
      queryClient.invalidateQueries({
        queryKey: ['news'],
      })
      toastSuccess('Deleted news item')
    },
    onError: () => {
      toastError('Error: deleting news item')
    },
  })

  const handleSubmit = (vals: NewsItemPayload) => {
    editNewsItemMutation.mutateAsync(vals)
  }
  const handleDelete = () => {
    if (window.confirm('Are you sure you wish to delete this item?')) deleteNewsItemMutation.mutateAsync()
  }

  const tData = { ...data, createdAt: new Date(data.createdAt)?.toISOString().substring(0, 10) } satisfies NewsItem

  return <NewsItemForm onSubmit={handleSubmit} onDelete={handleDelete} defaultValues={tData} />
}

const EditNewsItemPage = () => {
  const { id: idParam } = useParams<{ id: string }>()
  const { data, isLoading } = useNewsItemRequest(idParam!)

  return (
    <AdminWrapper>
      <FormPageContainer>
        <BackLinkMargin linkTo="/account/admin/news">Back to admin news list</BackLinkMargin>
        <PageTitle>Edit news item</PageTitle>
        {isLoading ? <Loader /> : data ? <EditNewsItemMutation data={data} /> : <div>News item not found.</div>}
      </FormPageContainer>
    </AdminWrapper>
  )
}

export default EditNewsItemPage
