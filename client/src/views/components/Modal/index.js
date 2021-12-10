import React from 'react'
import PropTypes from 'prop-types'
import ReactModal from 'react-modal'
import classNames from 'classnames/bind'

import Loader from '../Loader'
import './style.sass'


const Modal = ({ children, className, modalFooterContent, isOpen, isLoading, title, subTitle, noPadding, hideModalHandler, ...rest }) => {
  const classes = classNames({
    'pfda-modal--loading': isLoading,
    'pfda-modal--no-padding': noPadding,
  }, 'pfda-modal', className)

  const hideHandler = () => {
    if (isLoading) return false
    hideModalHandler()
  }

  return (
    <ReactModal
      isOpen={isOpen}
      className={classes}
      overlayClassName='pfda-modal__overlay'
      ariaHideApp={false}
      onRequestClose={hideHandler}
      aria={
        {
        label: title,
        }
      }
      {...rest}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" aria-label="Close" onClick={hideHandler}>
              <span aria-hidden="true">×</span>
            </button>
            <h4 className="modal-title">{title}</h4>
            {(subTitle) && (
              <div className="pfda-mr-t10">
                <small className="text-muted modal-text-color">{subTitle}</small>
              </div>
            )}
          </div>
          <div className="pfda-modal__content">

            {(isLoading) && (
              <div className="pfda-modal__loader">
                <Loader />
              </div>
            )}

            <div className="modal-body">
              {children}
            </div>

            {(modalFooterContent) && (
              <div className="modal-footer">
                {modalFooterContent}
              </div>
            )}

          </div>
        </div>
      </div>
    </ReactModal>
  )
}
export default Modal

Modal.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  modalFooterContent: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
  noPadding: PropTypes.bool,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  subTitle: PropTypes.string,
  hideModalHandler: PropTypes.func,
  className: PropTypes.any,
}
