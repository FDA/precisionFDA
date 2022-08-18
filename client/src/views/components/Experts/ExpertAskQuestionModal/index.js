import React, { useState } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import PropTypes from 'prop-types'

import Modal from '../../Modal'
import Button from '../../Button'
import TextareaField from '../../FormComponents/TextareaField'
import { GoogleReCaptchaV3 } from '../../../../components/ReCaptchaV3'

const Footer = ({ hideAction, action, isAskingDisabled }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="primary" onClick={action} disabled={isAskingDisabled}>Submit</Button>
  </>
)

const ExpertAskQuestionModalComponent = ({
  hideAction,
  action,
  title,
  user,
  isOpen,
  isLoading,
  isLoggedIn,
}) => {
  const [askedQuestion, setAskedQuestion] = useState('')
  const [triggerCaptcha, setTriggerCaptcha] = useState(false)
  const isAskingDisabled = (askedQuestion === '')

  const submitQuestion = () => {
    if (!isLoggedIn) {
      setTriggerCaptcha(true)
    } else {
      action(user.full_name, askedQuestion, null)
    }
  }

  const onCaptchaSuccess = (captchaValue) => {
    action(user.full_name, askedQuestion, captchaValue)
  }

  const closeAction = () => {
    setAskedQuestion('')
    setTriggerCaptcha(false)
    hideAction()
  }


  let submitter
  if (isLoggedIn) {
    submitter = (
      <a href={`/users/${user.dxuser}`} target="_blank" rel="noopener noreferrer">{user.full_name}</a>
    )
  } else {
    submitter = 'Anonymous'
  }

  const renderModal = () => (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={title}
        modalFooterContent={
          <Footer
            hideAction={closeAction}
            action={submitQuestion}
            isAskingDisabled={isAskingDisabled}
          />}
        hideModalHandler={closeAction}
        noPadding
      >
        <div className="modal-header">
          <span>Asking as:&nbsp;
            {submitter}
          </span>
          <div className='modal-body'>
            <TextareaField
              label=""
              placeholder='Submit a question..'
              aria_label='Ask a question to submit to Expert'
              style={{ height: '100px' }}
              value={askedQuestion}
              name='asking'
              onChange={(e) => setAskedQuestion(e.target.value)}
            />
            {triggerCaptcha && (
              <GoogleReCaptchaV3 callback={onCaptchaSuccess} action='question' />
            )}
          </div>
        </div>
      </Modal>
    </div>
  )

  const renderModalWithCaptcha = () => {
    if (PROD_OR_STAGE) {
      return (
        <GoogleReCaptchaProvider
          reCaptchaKey={RECAPTCHA_SITE_KEY}
          useEnterprise={true}
        >
          {renderModal()}
        </GoogleReCaptchaProvider>
      )
    }
    return renderModal()
  }

  return (isLoggedIn ? renderModal() : renderModalWithCaptcha())
}

ExpertAskQuestionModalComponent.propTypes = {
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
  user: PropTypes.object,
  expert: PropTypes.object,
  hideAction: PropTypes.func,
  action: PropTypes.func,
  title: PropTypes.string,
  isAskingDisabled: PropTypes.bool,
  isLoggedIn: PropTypes.bool,
}

ExpertAskQuestionModalComponent.defaultProps = {
  action: () => { },
  title: 'Submit a new question',
  hideAction: () => { },
}

Footer.propTypes = {
  action: PropTypes.func,
  hideAction: PropTypes.func,
  isAskingDisabled: PropTypes.bool,
}

export const ExpertAskQuestionModal = ExpertAskQuestionModalComponent
