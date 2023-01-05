import React, { useState } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { GoogleReCaptchaV3 } from '../../../components/ReCaptchaV3'
import { theme } from '../../../styles/theme'
import { Modal } from '../../modal'


const Asking = styled.div`
  display: flex;
  gap: 8px;
  margin: 16px 0;
`

const StyledTextArea = styled.textarea`
  font-family: ${theme.fontFamily};
  width: 100%;
`

const Content = styled.div`
  margin: 0 12px;
`

const Footer = ({ hideAction, action, isAskingDisabled }: any) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <ButtonSolidBlue onClick={action} disabled={isAskingDisabled}>
      Submit
    </ButtonSolidBlue>
  </>
)

const ExpertAskQuestionModalComponent = ({
  hideAction,
  action,
  title,
  user,
  isOpen,
  isLoggedIn,
}: any) => {
  const [askedQuestion, setAskedQuestion] = useState('')
  const [triggerCaptcha, setTriggerCaptcha] = useState(false)
  const isAskingDisabled = askedQuestion === ''

  const submitQuestion = () => {
    if (!isLoggedIn) {
      setTriggerCaptcha(true)
    } else {
      action(user.full_name, askedQuestion, null)
    }
  }

  const onCaptchaSuccess = (captchaValue: string) => {
    action(user.full_name, askedQuestion, captchaValue)
  }

  const closeAction = () => {
    setAskedQuestion('')
    setTriggerCaptcha(false)
    hideAction()
  }

  let submitter: string | React.ReactElement
  if (isLoggedIn) {
    submitter = (
      <a
        data-turbolinks="false"
        href={`/users/${user.dxuser}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {user.full_name}
      </a>
    )
  } else {
    submitter = 'Anonymous'
  }

  const renderModal = () => (
    <Modal
      id="ask-expert"
      isShown={isOpen}
      headerText={title}
      hide={closeAction}
      footer={
        <Footer
          hideAction={closeAction}
          action={submitQuestion}
          isAskingDisabled={isAskingDisabled}
        />
      }
      >
      <Content>
        <Asking>
          Asking as:&nbsp;
          {submitter}
        </Asking>

          <StyledTextArea
            placeholder="Submit a question.."
            aria-label="Ask a question to submit to Expert"
            style={{ height: '100px' }}
            value={askedQuestion}
            name="asking"
            onChange={e => setAskedQuestion(e.target.value)}
          />
          {triggerCaptcha && (
            <GoogleReCaptchaV3
              callback={onCaptchaSuccess}
              action="question"
            />
          )}
      </Content>
    </Modal>
  )

  const renderModalWithCaptcha = () => {
    if (PROD_OR_STAGE) {
      return (
        <GoogleReCaptchaProvider
          reCaptchaKey={RECAPTCHA_SITE_KEY}
          useEnterprise
        >
          {renderModal()}
        </GoogleReCaptchaProvider>
      )
    }
    return renderModal()
  }

  return isLoggedIn ? renderModal() : renderModalWithCaptcha()
}

export const ExpertAskQuestionModal = ExpertAskQuestionModalComponent
