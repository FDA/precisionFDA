import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import styled from 'styled-components'
import { InputText } from '../../components/InputText'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { useModal } from '../modal/useModal'
import { createWorkflowRequest } from './workflows.api'
import { Button } from '../../components/Button'
import { ButtonRow, Footer } from '../modal/styles'
import { FieldGroup } from '../../components/form/FieldGroup'

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`

export const useCreateWorkflowModal = () => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const [workflowName, setWorkflowName] = useState('')
  const mutation = useMutation({ 
    mutationKey: ['create-workflow'], 
    mutationFn: (name: string) => createWorkflowRequest(name),
    onSuccess: () => {
      setShowModal(false)
      setWorkflowName('')
      queryClient.invalidateQueries({
        queryKey: ['workflows'],
      })
      queryClient.invalidateQueries({
        queryKey: ['counters'],
      })
    },
  })

  const handleSubmit = () => {
    if (workflowName.trim()) {
      mutation.mutateAsync(workflowName.trim())
    }
  }

  const modalComp = (
    <ModalNext
      isShown={isShown}
      data-testid="create-workflow-modal"
      id="create-workflow-modal"
      headerText="Create a workflow"
      hide={() => setShowModal(false)}
      variant="small"
    >
      <ModalHeaderTop headerText="Create a workflow" hide={() => setShowModal(false)} />
      <StyledForm>
        <FieldGroup label="Workflow Name" required>
          <InputText 
            name="name" 
            placeholder="Enter Name..." 
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            disabled={mutation.isPending} 
          />
        </FieldGroup>
      </StyledForm>
      <Footer>
        <ButtonRow>
          <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button 
            data-variant="primary" 
            onClick={handleSubmit}
            disabled={mutation.isPending || !workflowName.trim()}
          >
            Create
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
  }
}
