import React from 'react'
import styled from 'styled-components'
import { Svg } from './Svg'

export const Done = () => (
  <Svg viewBox="0 0 20 20" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="10" fill="var(--success-500)" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="white" d="M6 10l2.5 2.5L14 7" />
  </Svg>
)

export const Idle = () => (
  <Svg viewBox="0 0 20 20" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="10" fill="var(--highlight-500)" />
    <rect x="6" y="7" width="8" height="1.5" rx="0.75" fill="white" />
    <rect x="6" y="10.25" width="8" height="1.5" rx="0.75" fill="white" />
    <rect x="6" y="13.5" width="8" height="1.5" rx="0.75" fill="white" />
  </Svg>
)

export const Runnable = () => (
  <Svg viewBox="0 0 20 20" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="10" fill="var(--primary-500)" />
    <path d="M8 6.5v7l5.5-3.5L8 6.5z" fill="white" />
  </Svg>
)

export const Terminated = () => (
  <Svg viewBox="0 0 20 20" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="10" fill="var(--tertiary-500)" />
    <rect x="6.5" y="6.5" width="7" height="7" rx="1" fill="white" />
  </Svg>
)

export const Failed = () => (
  <Svg viewBox="0 0 20 20" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="10" fill="var(--warning-500)" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="white" d="M7 7l6 6M13 7l-6 6" />
  </Svg>
)

export const Running = () => (
  <StyledSpinner viewBox="0 0 20 20" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="10" fill="var(--primary-100)" />
    <path className="spinner-circle" d="M10 2a8 8 0 0 1 8 8" stroke="var(--primary-500)" strokeWidth="2" strokeLinecap="round" />
  </StyledSpinner>
)

const StyledSpinner = styled(Svg)`
  .spinner-circle {
    transform-origin: center;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`
