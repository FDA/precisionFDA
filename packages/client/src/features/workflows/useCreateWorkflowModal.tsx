import React from 'react'
import { useMutation } from '@tanstack/react-query'
import styled from 'styled-components'
import { InputText } from '../../components/InputText'
import { Modal } from '../modal'
import { useModal } from '../modal/useModal'
import { createWorkflowRequest } from './workflows.api'
import { Button } from '../../components/Button'

const StyledForm = styled.form`
  display: flex;
`

export const useCreateWorkflowModal = () => {
  const { isShown, setShowModal } = useModal()
  const mutation = useMutation({ mutationKey: ['create-workflow'], mutationFn: (name: string) => createWorkflowRequest(name) })
  const modalComp = (
    <Modal headerText="Create an workflow" isShown={isShown} hide={() => setShowModal(false)} >
      <StyledForm onSubmit={(e) => mutation.mutateAsync(e.currentTarget.name)}>
        <InputText label="Workflow Name" name="name" placeholder="Enter Name..." autoFocus disabled={mutation.isPending} />
        <Button data-variant="primary" type="submit" disabled={mutation.isPending}>Create</Button>
      </StyledForm>
      <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>Cancel</Button>
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
  }
}
