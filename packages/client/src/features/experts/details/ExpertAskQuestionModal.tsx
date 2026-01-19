import React, { useState } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { GoogleReCaptchaV3 } from '../../../components/ReCaptchaV3'
import { theme } from '../../../styles/theme'
import { getRuntimeEnv } from '@/utils/runtimeEnv'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer as ModalFooter } from '../../modal/styles'

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

interface FooterProps {
  hideAction: () => void
  action: () => void
  isAskingDisabled: boolean
}

const Footer = ({ hideAction, action, isAskingDisabled }: FooterProps) => (
  <ButtonRow>
    <Button onClick={hideAction}>Cancel</Button>
    <Button data-variant="primary" onClick={action} disabled={isAskingDisabled}>
      Submit
    </Button>
  </ButtonRow>
)

const ExpertAskQuestionModalComponent = ({
  hideAction,
  action,
  title,
  user,
  isOpen,
  isLoggedIn,
}: {
  hideAction: () => void
  action: (fullName: string, question: string, captcha: string | null) => void
  title: string
  user: { full_name: string; dxuser: string }
  isOpen: boolean
  isLoggedIn: boolean
}) => {
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
      <a data-turbolinks="false" href={`/users/${user.dxuser}`} target="_blank" rel="noopener noreferrer">
        {user.full_name}
      </a>
    )
  } else {
    submitter = 'Anonymous'
  }

  const renderModal = () => (
    <ModalNext id="ask-expert" isShown={isOpen} headerText={title} hide={closeAction} variant="medium">
      <ModalHeaderTop headerText={title} hide={closeAction} />
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
        {triggerCaptcha && <GoogleReCaptchaV3 callback={onCaptchaSuccess} action="question" />}
      </Content>
      <ModalFooter>
        <Footer hideAction={closeAction} action={submitQuestion} isAskingDisabled={isAskingDisabled} />
      </ModalFooter>
    </ModalNext>
  )

  const renderModalWithCaptcha = () => {
    const recaptchaSiteKey = getRuntimeEnv().RECAPTCHA_SITE_KEY
    if (recaptchaSiteKey) {
      return (
        <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey} useEnterprise>
          {renderModal()}
        </GoogleReCaptchaProvider>
      )
    }
    return renderModal()
  }

  return isLoggedIn ? renderModal() : renderModalWithCaptcha()
}

export const ExpertAskQuestionModal = ExpertAskQuestionModalComponent
