import React from 'react'
import PropTypes from 'prop-types'

import Button from '../../Button'
import Modal from '../../Modal'
import './style.sass'


const getConfirmationMessage = (title) => {
  switch(title) {
    case 'docker': {
      return 'You are about to download a Dockerfile to run this app in a Docker container on your local machine. For more information please consult the app export section in the precisionFDA docs.'
    }
    case 'cwl': {
      return 'You are about to download a CWL Tool package to your local machine. For more information please consult the app export section in the precisionFDA docs.'
    }
    case 'wdl': {
      return 'You are about to download a WDL Task package to your local machine. For more information please consult the app export section in the precisionFDA docs.'
    }
    default: {
      return 'You are about to download a file to your local machine. For more information please consult the app export section in the precisionFDA docs.'
    }
  }
}

const HomeExportModal = ({ isOpen, hideAction, isLoading, options, title }) => {
  const actionList = options.map((e) => {
    return (
      <li data-turbolinks='false' key={e.label} className='home-export-modal__item'>
        <a href={e.link} data-confirm={e.value && getConfirmationMessage(e.value)} data-method={e.isPost && 'post'}>{e.label}</a>
      </li>
    )
  })

  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={title}
        modalFooterContent={
          <Button onClick={hideAction}>Cancel</Button>
        }
        hideModalHandler={hideAction}
        noPadding
      >
        <ul className='home-export-modal'>{actionList}</ul>
      </Modal>
    </div>
  )
}

HomeExportModal.propTypes = {
  hideAction: PropTypes.func,
  options: PropTypes.array,
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
  title: PropTypes.string,
}

HomeExportModal.defaultProps = {
  title: 'Export to',
  options: [],
}

export default HomeExportModal

export {
  HomeExportModal,
}
