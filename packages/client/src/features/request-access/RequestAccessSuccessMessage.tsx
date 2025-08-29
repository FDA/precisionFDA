import React from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { CircleCheckIcon } from '../../components/icons/CircleCheckIcon'
import { MessageWrapper } from './style'

export const RequestAccessSuccessMessage = () => {
  const navigate = useNavigate()
  const handleBackToHome = () => {
    navigate('/')
  }
  return (
    <MessageWrapper>
      <CircleCheckIcon width={48} height={48} fill="var(--success-500)" />
      <h3>Thank you for your request!</h3>
      <p>
        Your request has been registered. Check your email for additional instructions. If you do not receive a confirmation email
        within 24 hours of registration, please email precisionFDA support at{' '}
        <a href="mailto:precisionFDA@fda.hhs.gov">precisionFDA@fda.hhs.gov</a>.
      </p>
      <Button data-variant="primary" onClick={handleBackToHome}>
        Back to Home
      </Button>
    </MessageWrapper>
  )
}
