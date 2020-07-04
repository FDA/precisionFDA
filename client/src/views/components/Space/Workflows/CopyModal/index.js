import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import WorkflowShape from '../../../../shapes/WorkflowShape'
import Button from '../../../Button'
import Modal from '../../../Modal'
import {
  spaceWorkflowsCopyModalSelector,
  spaceWorkflowsLinksSelector,
} from '../../../../../reducers/spaces/workflows/selectors'
import { spaceAccessibleSpacesSelector } from '../../../../../reducers/spaces/space/selectors'
import {
  hideWorkflowsCopyModal,
  fetchAccessibleSpaces,
  copyToSpace,
} from '../../../../../actions/spaces'
import SpacesList from './SpacesList'
import './style.sass'


const getSelectedSpace = (spaces = []) => {
  const filtered = spaces.filter((space) => space.isSelected)
  return (filtered.length) ? filtered[0] : null
}

const Footer = ({ hideAction, copyAction, isCopyDisabled }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="primary" onClick={copyAction} disabled={isCopyDisabled}>Copy</Button>
  </>
)

const CopyModal = ({ workflows, loadWorkflowsHandler }) => {
  const modal = useSelector(spaceWorkflowsCopyModalSelector, shallowEqual)
  const spaces = useSelector(spaceAccessibleSpacesSelector)
  const workflowsLinks = useSelector(spaceWorkflowsLinksSelector, shallowEqual)
  const ids = workflows.map((workflow) => workflow.id)
  const selectedSpace = getSelectedSpace(spaces)

  const dispatch = useDispatch()
  const hideAction = () => dispatch(hideWorkflowsCopyModal())
  const getSpacesAction = () => dispatch(fetchAccessibleSpaces())

  const copyAction = () => {
    if (selectedSpace) {
      return dispatch(copyToSpace(workflowsLinks.copy, selectedSpace.scope, ids)).then((statusIsOk) => {
        if (statusIsOk) loadWorkflowsHandler()
      })
    }
  }

  useEffect(() => {
    if (modal.isOpen) getSpacesAction()
  }, [modal.isOpen, workflows])

  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={modal.isOpen}
        isLoading={modal.isLoading}
        title="Select Space"
        modalFooterContent={
          <Footer
            hideAction={hideAction}
            copyAction={copyAction}
            isCopyDisabled={!selectedSpace}
          />}
        hideModalHandler={hideAction}
        noPadding
      >
        <div>
          <SpacesList spaces={spaces} />
        </div>
      </Modal>
    </div>
  )
}

export default CopyModal

CopyModal.propTypes = {
  loadWorkflowsHandler: PropTypes.func,
  workflows: PropTypes.arrayOf(PropTypes.exact(WorkflowShape)),
}

Footer.propTypes = {
  step: PropTypes.number,
  hideAction: PropTypes.func,
  copyAction: PropTypes.func,
  getSpacesAction: PropTypes.func,
  isCopyDisabled: PropTypes.bool,
}
