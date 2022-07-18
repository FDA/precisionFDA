import React, { useState } from 'react'
import PropTypes from 'prop-types'
import ReCAPTCHA from 'react-google-recaptcha'

import Modal from '../../Modal'
import Button from '../../Button'
import TextareaField from '../../FormComponents/TextareaField'
import { RECAPTCHA_KEYS } from '../../../../constants'


const Footer = ({ hideAction, action, isAskingDisabled }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="primary" onClick={action} disabled={isAskingDisabled}>Submit</Button>
  </>
)

const ExpertAskQuestionModalComponent = ({
  hideAction,
  action,
  expert = {},
  title,
  user,
  isOpen,
  isLoading,
  isLoggedIn,
}) => {
  const [askedQuestion, setAskedQuestion] = useState('')
  const [showCaptcha, setShowCaptcha] = useState(false)
  const isAskingDisabled = (askedQuestion === '')

  const submitQuestion = () => {
    // Captcha render is disabled for now
    // if (!isLoggedIn) {
    //   console.log(": submitQuestion Before ReCAPTCHA: isLoggedIn  = ",isLoggedIn)
    //   console.log(": submitQuestion Before ReCAPTCHA: RECAPTCHA_KEYS.SITE  = ",RECAPTCHA_KEYS.SITE)
      // setShowCaptcha(true)
      // console.log(": submitQuestion showCaptcha = ",showCaptcha)
    // } else {
      action(user.full_name, askedQuestion, expert.id)
    // }
  }

  const captchaCheck = () => {
    // to add a Captcha result check call
  }

  const closeAction = () => {
    setAskedQuestion('')
    setShowCaptcha(false)
    hideAction()
  }

  var submitter
    if (isLoggedIn) {
      submitter = (
        <a href={`/users/${user.dxuser}`} target="_blank" rel="noopener noreferrer">{user.full_name}</a>
      )
    } else {
      submitter = 'Anonymous'
    }

  return (
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
              label={''}
              placeholder='Submit a question..'
              aria_label='Ask a question to submit to Expert'
              style={{ height: '100px' }}
              value={askedQuestion}
              name='asking'
              onChange={(e) => setAskedQuestion(e.target.value)}
            />
            {showCaptcha && (
              <ReCAPTCHA
                sitekey={RECAPTCHA_KEYS.SITE}
                onChange={captchaCheck}
              />
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
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
  action: () => {},
  title: 'Submit a new question',
  expert: {},
  hideAction: () => {},
}

Footer.propTypes = {
  action: PropTypes.func,
  hideAction: PropTypes.func,
  isAskingDisabled: PropTypes.bool,
}

export const ExpertAskQuestionModal = ExpertAskQuestionModalComponent
