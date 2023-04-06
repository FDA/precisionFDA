import React from 'react'
import { useMutation } from '@tanstack/react-query'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { InputText } from '../../../components/InputText'
import { Modal } from '../../modal'
import { useModal } from '../../modal/useModal'
import { createWorkflowRequest } from './workflows.api'

const StyledForm = styled.form`
  display: flex;
`

export const useCreateWorkflowModal = () => {
  const { isShown, setShowModal } = useModal()
  const mutation = useMutation({ mutationKey: ['create-workflow'], mutationFn: (name: string) => createWorkflowRequest(name) })
  const modalComp = isShown && (
    <Modal headerText="Create an workflow" isShown={isShown} hide={() => setShowModal(false)} >
      <StyledForm onSubmit={(e) => mutation.mutateAsync(e.currentTarget.name)}>
        <InputText label="Workflow Name" name="name" placeholder="Enter Name..." autoFocus disabled={mutation.isLoading} />
        <ButtonSolidBlue type="submit" disabled={mutation.isLoading}>Create</ButtonSolidBlue>
      </StyledForm>
      <Button onClick={() => setShowModal(false)} disabled={mutation.isLoading}>Cancel</Button>
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
  }
}
