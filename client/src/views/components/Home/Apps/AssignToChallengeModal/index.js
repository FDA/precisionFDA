import React, { useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import Button from '../../../Button'
import Modal from '../../../Modal'
import Icon from '../../../Icon'


const AssignToChallengeModal = (props) => {
  const { isOpen, hideAction, challenges, title, assignAction, isLoading } = props

  const [selectedChallengeId, setSelectedChallengeId] = useState(null)

  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={title}
        modalFooterContent={
          <>
            <Button onClick={hideAction}>Cancel</Button>
            <Button type="primary" onClick={() => assignAction(selectedChallengeId)} disabled={!selectedChallengeId}>Assign</Button>
          </>
        }
        hideModalHandler={hideAction}
        noPadding
      >
        <div className='home-page-layout__modals-items'>
          {challenges.map((challenge) => {
            const isSelected = selectedChallengeId === challenge.id
            const classes = classNames({
              'home-page-layout__modals-items_item--selected': isSelected,
            }, 'home-page-layout__modals-items_item')

            return (
              <div key={challenge.id} className={classes} onClick={() => setSelectedChallengeId(challenge.id)}>
                <div>
                  {challenge.name}
                </div>
                <div>
                  {isSelected && <Icon icon="fa-check-circle" />}
                </div>
              </div>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}

AssignToChallengeModal.propTypes = {
  challenges: PropTypes.array,
  assignAction: PropTypes.func,
  title: PropTypes.string,
  isLoading: PropTypes.bool,
  isOpen: PropTypes.bool,
  hideAction: PropTypes.func,
}

AssignToChallengeModal.defaultProps = {
  challenges: [],
  assignAction: () => {},
  title: 'Assign to Challenge',
  hideAction: () => {},
}

export default AssignToChallengeModal

export {
  AssignToChallengeModal,
}
