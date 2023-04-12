import React, { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button, ButtonSolidRed } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import {
  ResourceTable
} from '../../../components/ResourceTable'
import { Modal } from '../../modal'
import { ButtonRow, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { terminateJobsRequest } from './executions.api'
import { IExecution } from './executions.types'

const StyledResourceTable = styled(ResourceTable)`
  padding: 0.5rem;
  min-width: 300px;
`

export function useTerminateModal<T extends { ids: string[]; name: string }>({
  selected,
}: {
  selected: IExecution[]
}) {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => selected, [isShown])
  const mutation = useMutation({
    mutationKey: ['terminate-job'],
    mutationFn: terminateJobsRequest,
    onError: () => {
      toast.error(`Error: terminating execution`)
    },
    onSuccess: (res: any) => {
      if (res?.meta?.messages[0]) {
        toast.error(`Server error: ${res?.meta?.messages[0].message}`)
        return
      }
      queryClient.invalidateQueries(['jobs'])
      queryClient.invalidateQueries(['execution', selected[0].uid])
      setShowModal(false)
      toast.success(`Success: ${res?.message?.text}`)
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(memoSelected.map(x => x.uid))
  }

  const modalComp = isShown && (
    <Modal
      data-testid={`modal-execution-terminate`}
      headerText={`Terminate selected execution?`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      footer={
        <ButtonRow>
          {mutation.isLoading && <Loader />}
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <ButtonSolidRed onClick={handleSubmit} disabled={mutation.isLoading}>
            Terminate
          </ButtonSolidRed>
        </ButtonRow>
      }
    >
      <ModalScroll>
        <StyledResourceTable
          rows={selected.map(s => {
            return {
              name: <div>{s.name}</div>,
            }
          })}
        />
      </ModalScroll>
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
