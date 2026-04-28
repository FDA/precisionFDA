import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { BackLink } from '@/components/Page/PageBackLink'
import { PageTitle } from '@/components/Page/styles'
import { AdminWrapper } from '../../admin/AdminWrapper'
import { createNewsItemRequest } from '../api'
import { NewsItemPayload } from '../types'
import { NewsItemForm } from './NewsItemForm'
import { FormPageContainer } from './styles'

const CreateNewsItemPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createNewsItemMutation = useMutation({
    mutationKey: ['create-news-item'],
    mutationFn: (payload: NewsItemPayload) => createNewsItemRequest(payload),
    onSuccess: () => {
      navigate('/account/admin/news')
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
    <AdminWrapper>
      <FormPageContainer>
        <BackLink linkTo="/account/admin/news">Back to admin news list</BackLink>
        <PageTitle>Create a news item</PageTitle>
        <NewsItemForm onSubmit={handleSubmit} />
      </FormPageContainer>
    </AdminWrapper>
  )
}

export default CreateNewsItemPage
