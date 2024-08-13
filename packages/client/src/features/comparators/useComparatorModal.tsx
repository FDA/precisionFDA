import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { checkStatus, getApiRequestOpts } from '../../utils/api'
import { Modal } from '../modal'
import { StyledModalContent } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { FileLicense } from '../assets/assets.types'
import { Button } from '../../components/Button'


type ComparatorActionTypes = 'remove_from_comparators' | 'add_to_comparators' | 'set_app'

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


export async function addToComparatorsRequest(payload: any) {
  return fetch('/admin/apps/add_to_comparators', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify(payload),
  }).then(checkStatus)
}

export async function removeFromComparatorsRequest(payload: any) {
  return fetch('/admin/apps/remove_from_comparators', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify(payload),
  }).then(checkStatus)
}

export async function setAppDefaultComparatorsRequest(payload: any) {
  return fetch('/admin/apps/set_comparison_app', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify(payload),
  }).then(checkStatus)
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
  onSuccess?: (res?: any) => void
}) {
  const { isShown, setShowModal } = useModal()
  const mutation = useMutation({
    mutationKey: ['comparator-action'],
    mutationFn: async ({ actionType, dxid }: ComparatorActionRequest) => {
      return comparatorActionRequest(actionType, dxid)
    },
    onError: (res) => {
      toast.error(`Error: ${comparatorActionText(actionType)} request`)
    },
    onSuccess: (res: any) => {
      if (res.error) {
        toast.error('Error: ' + res.error)
        setShowModal(false)
        return
      }
      const messages = res?.meta?.messages
      if (messages) {
        messages.forEach((message: any) => {
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

  const handeExternalSetShowModal = (isShown: boolean, actionType: ComparatorActionTypes) => {
    setShowModal(isShown)
  }

  const handleComparatorSubmit = ({ actionType, dxid }: { actionType: ComparatorActionTypes, dxid?: string }) => {
    if(actionType && dxid) mutation.mutateAsync({ actionType, dxid })
  }

  const getFooter = () => {
    switch (actionType) {
      case 'remove_from_comparators':
        return (
          <>
            <Button onClick={handleClose} disabled={mutation.isPending}>Cancel</Button>
            <Button data-variant="warning" onClick={() => handleComparatorSubmit({ actionType: 'remove_from_comparators', dxid: selected.dxid })} disabled={mutation.isPending}>Remove from Comparators</Button>
          </>
        )
      case 'add_to_comparators':
        return (
          <>
            <Button onClick={handleClose} disabled={mutation.isPending}>Cancel</Button>
            <Button data-variant="primary" onClick={() => handleComparatorSubmit({ actionType: 'add_to_comparators', dxid: selected.dxid })} disabled={mutation.isPending}>Add to Comparators</Button>
          </>
        )
      case 'set_app':
        return (
          <>
            <Button onClick={handleClose} disabled={mutation.isPending}>No</Button>
            <Button data-variant="primary" onClick={() => handleComparatorSubmit({ actionType: 'set_app', dxid: selected.dxid })} disabled={mutation.isPending}>Yes</Button>
          </>
        )
      default:
        return (
          <Button onClick={handleClose}>Cancel</Button>
        )
    }
  }


  const modalComp = (
    <Modal
      data-testid={`modal-comparator-${actionType}`}
      headerText={`Attention!`}
      isShown={isShown}
      hide={handleClose}
      footer={getFooter()}
    >
      <StyledModalContent>
        {getMessage(actionType)}
      </StyledModalContent>
    </Modal>
  )
  return {
    modalComp,
    setShowModal: handeExternalSetShowModal,
    isShown,
  }
}
