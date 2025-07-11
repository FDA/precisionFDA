import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, StyledModalContent } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { FileLicense } from '../assets/assets.types'
import { Button } from '../../components/Button'
import axios from 'axios'


type ComparatorActionTypes = 'remove_from_comparators' | 'add_to_comparators' | 'set_app'

interface ComparatorPayload {
  dxid: string
}

interface ApiResponse {
  error?: string
  meta?: {
    messages?: Array<{
      type: string
      message: string
    }>
  }
}

const getMessage = (actionType?: ComparatorActionTypes) => {
  switch (actionType) {
    case 'remove_from_comparators':
      return 'Are you sure you want remove this app from comparators?'
    case 'add_to_comparators':
      return 'Are you sure you want add this app to comparators?'
    case 'set_app':
      return 'Are you sure you want to set this app as comparison default?'
    default:
      return ''
  }
}

export type SetShowModalArgs = (isShown: boolean, actionType: ComparatorActionTypes) => void
export type ComparatorActionRequest = { actionType: ComparatorActionTypes, dxid: string }

export async function addToComparatorsRequest(payload: ComparatorPayload) {
  const response = await axios.post('/admin/apps/add_to_comparators', payload)
  return response.data
}

export async function removeFromComparatorsRequest(payload: ComparatorPayload) {
  const response = await axios.post('/admin/apps/remove_from_comparators', payload)
  return response.data
}

export async function setAppDefaultComparatorsRequest(payload: ComparatorPayload) {
  const response = await axios.post('/admin/apps/set_comparison_app', payload)
  return response.data
}

const comparatorActionRequest = (actionType: ComparatorActionTypes, dxid: string) => {
  switch (actionType) {
    case 'add_to_comparators':
      return addToComparatorsRequest({ dxid })
    case 'remove_from_comparators':
      return removeFromComparatorsRequest({ dxid })
    case 'set_app':
      return setAppDefaultComparatorsRequest({ dxid })
    default:
      return async () => {}
  }
}

const comparatorActionText = (actionType?: ComparatorActionTypes) => {
  switch (actionType) {
    case 'add_to_comparators':
      return 'Add to comparators'
    case 'remove_from_comparators':
      return 'Remove from comparators'
    case 'set_app':
      return 'Set as default'
    default:
      return 'unknown'
  }
}

export function useComparatorModal<
  T extends { uid?: string; dxid?: string; file_license?: FileLicense },
>({
  actionType,
  selected,
  onSuccess,
}: {
  actionType: ComparatorActionTypes
  selected: T
  onSuccess?: (res?: ApiResponse) => void
}) {
  const { isShown, setShowModal } = useModal()
  const mutation = useMutation({
    mutationKey: ['comparator-action'],
    mutationFn: async ({ actionType: mutationActionType, dxid }: ComparatorActionRequest) => {
      return comparatorActionRequest(mutationActionType, dxid)
    },
    onError: () => {
      toast.error(`Error: ${comparatorActionText(actionType)} request`)
    },
    onSuccess: (res: ApiResponse) => {
      if (res.error) {
        toast.error('Error: ' + res.error)
        setShowModal(false)
        return
      }
      const messages = res?.meta?.messages
      if (messages) {
        messages.forEach((message) => {
          if (message.type === 'warning') {
            toast.error(message.message)
          }
        })
      } else {
        if(onSuccess) onSuccess()
        setShowModal(false)
        toast.success(`Success: ${comparatorActionText(actionType)} request`)
      }
    },
  })

  const handleClose = () => {
    setShowModal(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleExternalSetShowModal = (modalShown: boolean, modalActionType: ComparatorActionTypes) => {
    // Note: modalActionType parameter is required by SetShowModalArgs type but not used in current implementation
    setShowModal(modalShown)
  }

  const handleComparatorSubmit = ({ actionType: submitActionType, dxid }: { actionType: ComparatorActionTypes, dxid?: string }) => {
    if(submitActionType && dxid) mutation.mutateAsync({ actionType: submitActionType, dxid })
  }

  const getFooter = () => {
    switch (actionType) {
      case 'remove_from_comparators':
        return (
          <ButtonRow>
            <Button onClick={handleClose} disabled={mutation.isPending}>Cancel</Button>
            <Button data-variant="warning" onClick={() => handleComparatorSubmit({ actionType: 'remove_from_comparators', dxid: selected.dxid })} disabled={mutation.isPending}>Remove from Comparators</Button>
          </ButtonRow>
        )
      case 'add_to_comparators':
        return (
          <ButtonRow>
            <Button onClick={handleClose} disabled={mutation.isPending}>Cancel</Button>
            <Button data-variant="primary" onClick={() => handleComparatorSubmit({ actionType: 'add_to_comparators', dxid: selected.dxid })} disabled={mutation.isPending}>Add to Comparators</Button>
          </ButtonRow>
        )
      case 'set_app':
        return (
          <ButtonRow>
            <Button onClick={handleClose} disabled={mutation.isPending}>No</Button>
            <Button data-variant="primary" onClick={() => handleComparatorSubmit({ actionType: 'set_app', dxid: selected.dxid })} disabled={mutation.isPending}>Yes</Button>
          </ButtonRow>
        )
      default:
        return (
          <ButtonRow>
            <Button onClick={handleClose}>Cancel</Button>
          </ButtonRow>
        )
    }
  }


  const modalComp = (
    <ModalNext
      data-testid={`modal-comparator-${actionType}`}
      headerText='Attention!'
      isShown={isShown}
      hide={handleClose}
      variant="small"
      id={`comparator-modal-${actionType}`}
    >
      <ModalHeaderTop headerText='Attention!' hide={handleClose} />
      <StyledModalContent>
        {getMessage(actionType)}
      </StyledModalContent>
      <Footer>
        {getFooter()}
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal: handleExternalSetShowModal,
    isShown,
  }
}
