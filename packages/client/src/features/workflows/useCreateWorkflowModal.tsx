import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ChangeEvent, type ComponentProps, type ComponentType, type JSX, useState } from 'react'
import styled from 'styled-components'
import { Button } from '@/components/Button'
import { FieldGroup } from '@/components/form/FieldGroup'
import { InputText } from '@/components/InputText'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { createWorkflowRequest } from './workflows.api'

const StyledForm: ComponentType<ComponentProps<'div'>> = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`

interface UseCreateWorkflowModalResult {
  modalComp: JSX.Element
  setShowModal: (val: boolean) => void
}

export const useCreateWorkflowModal = (): UseCreateWorkflowModalResult => {
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

  const handleSubmit = (): void => {
    if (workflowName.trim()) {
      void mutation.mutateAsync(workflowName.trim())
    }
  }

  const modalComp = (
    <ModalNext
      isShown={isShown}
      data-testid="create-workflow-modal"
      id="create-workflow-modal"
      headerText="Create a workflow"
      hide={(): void => setShowModal(false)}
      variant="small"
    >
      <ModalHeaderTop headerText="Create a workflow" hide={(): void => setShowModal(false)} />
      <StyledForm>
        <FieldGroup label="Workflow Name" required>
          <InputText
            name="name"
            placeholder="Enter Name..."
            value={workflowName}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => setWorkflowName(e.target.value)}
            disabled={mutation.isPending}
          />
        </FieldGroup>
      </StyledForm>
      <Footer>
        <ButtonRow>
          <Button onClick={(): void => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button data-variant="primary" onClick={handleSubmit} disabled={mutation.isPending || !workflowName.trim()}>
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
