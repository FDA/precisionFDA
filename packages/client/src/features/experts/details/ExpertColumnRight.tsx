import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router'
import { EXPERT_STATE } from '../../../constants'
import { IUser } from '../../../types/user'
import { IToCItem, ToC } from '../../markdown/Toc'
import { useModal } from '../../modal/useModal'
import { askQuestion, deleteExpertRequest } from '../api'
import { ExpertDetails } from '../types'
import { ExpertAskQuestionModal } from './ExpertAskQuestionModal'
import { StyledPageRightColumn } from './styles'
import { Button } from '../../../components/Button'
import { useConfirm } from '../../modal/useConfirm'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
`

export const ExpertColumnRight = ({ expert, user, toc }: { expert: ExpertDetails; user: IUser; toc?: IToCItem[] }) => {
  const modal = useModal()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userExpert = expert && expert.user_id === user?.id
  const expertIsOpened = expert && expert.state === EXPERT_STATE.OPEN
  const editPermitted = userExpert || user?.can_administer_site
  const isLoggedIn = (user?.id && Object.keys(user).length > 0) || false
  const createQuestionMutation = useMutation({
    mutationKey: ['create-question'],
    mutationFn: ({ userName, question, captchaValue }: { userName: string; question: string; captchaValue: string }) =>
      askQuestion({ userName, question, captchaValue }, expert.id.toString()),
    onError: error => {
      const errorMessage = error?.message || 'Your question was not submitted due to internal error'
      toastError(errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['queryExpertDetails'],
      })
      toastSuccess('Your question was submitted successfully')
      modal.setShowModal(false)
      navigate(`/experts/${expert.id}`)
    },
  })

  const deleteMutation = useMutation({
    mutationKey: ['delete-expert'],
    mutationFn: () => deleteExpertRequest(expert.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
      toastSuccess('Expert was deleted successfully')
      navigate('/experts')
    },
    onError: error => {
      const errorMessage = error?.message
      toastError(errorMessage || 'Expert was not deleted due to internal error')
    },
  })

  const { open: openConfirmation, Confirm: ConfirmSubmit } = useConfirm({
    onOk: deleteMutation.mutate,
    okText: 'OK',
    headerText: 'You are about to delete this expert',
    body: (
      <div>
        <p>Are you sure you would like to continue? This will delete the expert and all its related Q&A.</p>
      </div>
    ),
  })

  const askExpert = (userName: string, question: string, captchaValue: string | null) => {
    createQuestionMutation.mutateAsync({ userName, question, captchaValue: captchaValue ?? '' })
  }

  return (
    <StyledPageRightColumn>
      <ActionRow>
        {expertIsOpened && (
          <div>
            <Button data-variant="primary" onClick={() => modal.setShowModal(true)}>
              Ask this expert
            </Button>
          </div>
        )}
        {editPermitted && (
          <Button data-variant="primary" as="a" data-turbolinks="false" href={`/experts/${expert?.id}/edit`}>
            Edit Expert Info
          </Button>
        )}
        {user?.can_administer_site && (
          <>
            <Button data-variant="warning" onClick={openConfirmation}>
              Delete Expert
            </Button>
            <ConfirmSubmit />
          </>
        )}
      </ActionRow>
      {toc && toc.length > 0 && (
        <ActionRow>
          <ToC items={toc} />
        </ActionRow>
      )}
      <ExpertAskQuestionModal
        isOpen={modal.isShown}
        user={user}
        hideAction={() => modal.setShowModal(false)}
        action={askExpert}
        isLoggedIn={isLoggedIn}
        title="Submit a new question"
      />
    </StyledPageRightColumn>
  )
}
