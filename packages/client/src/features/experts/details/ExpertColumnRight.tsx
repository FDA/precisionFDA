import { useMutation, useQueryClient } from '@tanstack/react-query'
import httpStatusCodes from 'http-status-codes'
import React from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { useNavigate } from 'react-router'
import { EXPERT_STATE } from '../../../constants'
import { IUser } from '../../../types/user'
import { ToC } from '../../markdown/Toc'
import { useModal } from '../../modal/useModal'
import { askQuestion } from '../api'
import { ExpertDetails } from '../types'
import { ExpertAskQuestionModal } from './ExpertAskQuestionModal'
import { StyledPageRightColumn } from './styles'
import { Button } from '../../../components/Button'

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
`

export const ExpertColumnRight = ({
  expert,
  user,
  toc,
}: {
  expert: ExpertDetails
  user: IUser
  toc?: any[]
}) => {
  const modal = useModal()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userExpert = expert && expert.user_id === user?.id
  const expertIsOpened = expert && expert.state === EXPERT_STATE.OPEN
  const editPermitted = userExpert || user?.can_administer_site
  const isLoggedIn = (user?.id && Object.keys(user).length > 0) || false
  const createQuestionMutation = useMutation({
    mutationKey: ['create-question'],
    mutationFn: ({
      userName,
      question,
      captchaValue,
    }: {
      userName: string
      question: string
      captchaValue: string
    }) =>
      askQuestion({ userName, question, captchaValue }, expert.id.toString()),
  })
  const askExpert = (
    userName: string,
    question: string,
    captchaValue: string,
  ) => {
    createQuestionMutation
      .mutateAsync({ userName, question, captchaValue })
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          queryClient.invalidateQueries({
            queryKey: ['queryExpertDetails'],
          })
          toast.success('Your question was submitted successfully')
          modal.setShowModal(false)
          navigate(`/experts/${expert.id}`)
        } else {
          const errorMessage = response.payload?.error?.message
          toast.error(errorMessage || 'Your question was not submitted')
        }
      })
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
          <div>
            <Button
              data-variant="primary"
              as="a"
              data-turbolinks="false"
              href={`/experts/${expert?.id}/edit`}
            >
              Edit Expert Info
            </Button>
          </div>
        )}
      </ActionRow>
      {toc && toc.length > 0 && (
        <ActionRow>
          <ToC items={toc} />
        </ActionRow>
      )}
      <ExpertAskQuestionModal
        isOpen={modal.isShown}
        isLoading={!expert}
        user={user}
        expert={expert}
        hideAction={() => modal.setShowModal(false)}
        action={askExpert}
        isLoggedIn={isLoggedIn}
        title="Submit a new question"
      />
    </StyledPageRightColumn>
  )
}