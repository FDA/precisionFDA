import React from 'react'
import PropTypes from 'prop-types'

import Modal from '../../../Modal'
import Button from '../../../Button'


const switchTitle = (action) => {
  switch (action) {
    case 'terminate':
      return 'Terminate'
    default:
      return 'Some Action'
  }
}

const SwitchFooter = ({ action, hideAction, modalAction }) => {
  switch (action) {
    case 'terminate':
      return (
        <>
          <Button onClick={hideAction}>Cancel</Button>
          <Button type="danger" onClick={modalAction}>Terminate</Button>
        </>
      )
    default:
      return (
        <Button onClick={hideAction}>Close</Button>
      )
  }
}

const HomeExecutionsActionModal = ({ modalAction, hideAction, action, executions = [], isOpen, isLoading }) => {
  const title = switchTitle(action)

  const list = executions.map((e, i) => {
    return (
      <tr key={i}>
        <td>
          {e.name}
        </td>
      </tr>
    )
  })

  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={`${title} ${executions.length} Item(s)?`}
        modalFooterContent={<SwitchFooter action={action} hideAction={hideAction} modalAction={modalAction} />}
        hideModalHandler={hideAction}
        noPadding
      >
        <table className='table objects-actions-modal__table'>
          <tbody>
            {list}
          </tbody>
        </table>
      </Modal>
    </div>
  )
}

HomeExecutionsActionModal.propTypes = {
  executions: PropTypes.array,
  modalAction: PropTypes.func,
  hideAction: PropTypes.func,
  action: PropTypes.string,
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
}

SwitchFooter.propTypes = {
  modalAction: PropTypes.func,
  hideAction: PropTypes.func,
  action: PropTypes.string,
}

export default HomeExecutionsActionModal

export {
  HomeExecutionsActionModal,
}
