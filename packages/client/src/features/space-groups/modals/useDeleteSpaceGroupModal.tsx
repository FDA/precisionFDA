import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { InfoCircleIcon } from '../../../components/icons/InfoCircleIcon'
import { Loader } from '../../../components/Loader'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { deleteSpaceGroupRequest } from '../api'
import { ISpaceGroup } from '../types'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  max-width: 600px;
`

const Message = styled.div`
  font-size: 15px;
  line-height: 1.4;

  strong {
    font-weight: 600;
  }
`

const InfoBox = styled.div`
  display: flex;
  align-items: center;
  background: var(--tertiary-100);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.4;

  svg {
    margin-right: 10px;
    flex-shrink: 0;
  }
`

const DeleteSpaceGroup = ({ spaceGroup }: { spaceGroup: ISpaceGroup }) => {
  if (!spaceGroup) return null
  return (
    <Wrapper>
      <Message>
        Are you sure you want to delete <strong>{spaceGroup.name}</strong> space group?
      </Message>
      <InfoBox>
        <InfoCircleIcon height={18} width={18} />
        <span>No space will be deleted by this action</span>
      </InfoBox>
    </Wrapper>
  )
}

export const useDeleteSpaceGroupModal = ({ spaceGroup }: { spaceGroup: ISpaceGroup }) => {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isShown, setShowModal } = useModal()

  const mutation = useMutation({ mutationFn: (id: number) => deleteSpaceGroupRequest(id) })

  const handleSubmit = async () => {
    try {
      await mutation.mutateAsync(spaceGroup.id)
      toast.success(`Space group ${spaceGroup.name} has been deleted`)
      setShowModal(false)
      queryClient.invalidateQueries({
        queryKey: ['space-group-list'],
      })
      queryClient.invalidateQueries({
        queryKey: ['space-groups', spaceGroup.id],
      })
      const currentGroupId = searchParams.get('spaceGroupId')
      if (currentGroupId === String(spaceGroup.id)) {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete('spaceGroupId')
        setSearchParams(newParams)
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        toast.error(`Deleting of space group ${spaceGroup.name} has failed due to: ${err?.response?.data?.error?.message}`)
      } else {
        toast.error(`Deleting of space group ${spaceGroup.name} has failed due to an unknown error`)
      }
    }
  }

  const modalComp = (
    <ModalNext id="delete-space-group" data-testid="delete-space-group" isShown={isShown} hide={() => setShowModal(false)}>
      <ModalHeaderTop disableClose={false} headerText="Delete Space Group" hide={() => setShowModal(false)} />
      <DeleteSpaceGroup spaceGroup={spaceGroup} />
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader />}
          <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button data-variant="warning" onClick={handleSubmit} disabled={mutation.isPending}>
            Delete
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
