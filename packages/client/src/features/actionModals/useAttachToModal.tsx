import React from 'react'
import { useModal } from '../modal/useModal'
import { AttachToModal } from './AttachToModal'

export type ATTACHABLE_TYPES = 'FILE' | 'APP' | 'DATABASE' | 'WORKFLOW' | 'JOB' | 'ASSET'

export function useAttachToModal(
  selectedFilesIds: string[] | number[],
  type: ATTACHABLE_TYPES,
) {
  const { isShown, setShowModal } = useModal()

  const modalComp = (
    <AttachToModal
      isShown={isShown}
      hideAction={() => setShowModal(false)}
      ids={selectedFilesIds}
      itemsType={type}
    />
  )

  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
