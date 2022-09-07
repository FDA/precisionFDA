import React from 'react'
import styled from 'styled-components'

const StyledGuestNotAllowed = styled.div`
  background-color: #fcf8e3;
  border: 1px solid transparent;
  border-color: #faebcc;
  color: #8a6d3b;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 3px;
  max-width: 762px;
  font-size: 18px;
`

const GuestNotAllowedLayout = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
`

export function GuestNotAllowed() {
  return (
    <GuestNotAllowedLayout>
      <StyledGuestNotAllowed>
        You are currently browsing precisionFDA as a guest. To log in and complete this action, your user account 
        must be provisioned. Your account is currently being reviewed by an FDA administrator for provisioning. 
        If you do not receive full access within 14 days, please contact precisionfda@fda.hhs.gov to request an 
        upgraded account with end-level access.
      </StyledGuestNotAllowed>
    </GuestNotAllowedLayout>
  )
}
