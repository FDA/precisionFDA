import React from 'react'
import { useDispatch } from 'react-redux'
import { appsAttachTo } from '../../../actions/home'
import { useModal } from '../../modal/useModal'
import HomeAttachToModal from './AttachToModal'

export enum OBJECT_TYPES {
  'FILE' = 'FILE',
  'APP' = 'APP',
  'DATABASE' = 'DATABASE',
  'WORKFLOW' = 'WORKFLOW',
  'JOB' = 'JOB',
  'ASSET' = 'ASSET',
}

// TODO: rewrite attach to modal to use react-query and toastify
export function useAttachToModal(
  selectedFilesIds: string[] | number[],
  type: OBJECT_TYPES
) {
  const dispatch = useDispatch()
  const { isShown, setShowModal } = useModal()

  const handleAttachToAction = (items: any, noteUids: any) => {
    dispatch(appsAttachTo(items, noteUids))
    setShowModal(false)
  }

  const modalComp = (
    <HomeAttachToModal
      isOpen={isShown}
      hideAction={() => setShowModal(false)}
      ids={selectedFilesIds}
      attachAction={handleAttachToAction}
      itemsType={type}
    />
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
