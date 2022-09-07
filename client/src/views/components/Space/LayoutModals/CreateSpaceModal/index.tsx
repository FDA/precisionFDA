import React, { FunctionComponent } from 'react'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import Modal from '../../../Modal'
import { spaceLayoutCreateSpaceModalSelector } from '../../../../../reducers/spaces/space/selectors'
import { hideLayoutCreateSpaceModal } from '../../../../../actions/spaces'
import './style.sass'
import { NEW_SPACE_PAGE_ACTIONS } from '../../../../../constants'
import { NewSpaceModalForm } from '../../../Spaces/NewSpaceModalForm'

const CreateSpaceModalComponent: FunctionComponent<{ action: string }> = ({ action = '' }) => {
  const modal = useSelector(spaceLayoutCreateSpaceModalSelector, shallowEqual)
  const dispatch = useDispatch()
  const hideAction = () => dispatch(hideLayoutCreateSpaceModal())
  const title = action === NEW_SPACE_PAGE_ACTIONS.EDIT ? 'Edit space' : 'Create a new space'

  return (
    // @ts-ignore
    <Modal isOpen={modal.isOpen} isLoading={modal.isLoading} title={title} hideModalHandler={hideAction}>
      {/*// @ts-ignore*/}
      <NewSpaceModalForm
        action={action}
        onCancelClick={hideAction}
      >
      </NewSpaceModalForm>
    </Modal>
  )
}

export const CreateSpaceModal = CreateSpaceModalComponent
