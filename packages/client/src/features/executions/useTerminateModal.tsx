import React, { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { ResourceTable } from '../../components/ResourceTable'
import { ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { terminateJobsRequest } from './executions.api'
import { IExecution } from './executions.types'
import { Button } from '../../components/Button'

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
      queryClient.invalidateQueries({
        queryKey: ['jobs'],
      })
      queryClient.invalidateQueries({
        queryKey: ['execution', selected[0].uid],
      })
      setShowModal(false)
      toast.success(`Success: ${res?.message?.text}`)
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(memoSelected.map(x => x.uid))
  }

  const modalComp = (
    <ModalNext
      id={'terminate-executions-modal'}
      data-testid={`modal-execution-terminate`}
      headerText={`Terminate selected execution?`}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalScroll>
        <StyledResourceTable
          rows={selected.map(s => {
            return {
              name: <div>{s.name}</div>,
              location: <div>{s.scope}</div>,
            }
          })}
        />
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader />}
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button data-variant="warning" onClick={handleSubmit} disabled={mutation.isPending}>
            Terminate
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
