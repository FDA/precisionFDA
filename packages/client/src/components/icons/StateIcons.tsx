import React from 'react'
import styled from 'styled-components'
import { Svg } from './Svg'

export const Done = () => (
  <Svg viewBox="0 0 23 23" width="23" height="23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 11.5a11.5 11.5 0 1 1-23 0 11.5 11.5 0 0 1 23 0Z" fill="#3B8348" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.44 6.97c.75.76.74 1.97-.02 2.71l-7.25 7.12c-.74.73-1.94.73-2.68 0l-3.16-3.1a1.92 1.92 0 1 1 2.69-2.74l1.81 1.79 5.9-5.8a1.92 1.92 0 0 1 2.71.02Z"
      fill="#fff"
    />
  </Svg>
)
export const Idle = () => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" width="23" height="23" fill="none">
    <circle cx="11.5" cy="11.5" r="11.5" fill="#D6A72F" />
    <path fill="#fff" fillRule="evenodd" d="M16.56 10.38V7H6.44v3.38h10.12Zm0 5.62v-3.38H6.44V16h10.12Z" clipRule="evenodd" />
  </Svg>
)
export const Runnable = () => (
  <Svg viewBox="0 0 23 23" width="23" height="23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11.5" cy="11.5" r="11.5" fill="#24739F" />
    <path d="M17.08 10.93a1.1 1.1 0 0 1 0 1.9l-7.8 4.5a1.1 1.1 0 0 1-1.65-.95V7.37c0-.84.91-1.37 1.64-.95l7.8 4.5Z" fill="#fff" />
  </Svg>
)
export const Terminated = () => (
  <Svg viewBox="0 0 23 23" width="23" height="23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11.5" cy="11.5" r="11.5" fill="#5B6164" />
    <path d="M7 7.5h9v9H7v-9Z" fill="#fff" />
  </Svg>
)
export const Failed = () => (
  <Svg viewBox="0 0 23 23" width="23" height="23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11.5" cy="11.5" r="11.5" fill="#CA5055" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.26 6.4c.7-.7 1.84-.7 2.53 0l8.29 8.29a1.79 1.79 0 0 1-2.53 2.53L6.26 8.93c-.7-.7-.7-1.83 0-2.53Z"
      fill="#fff"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.08 6.4c.7.7.7 1.83 0 2.53l-8.29 8.29a1.79 1.79 0 1 1-2.53-2.53l8.29-8.29c.7-.7 1.83-.7 2.53 0Z"
      fill="#fff"
    />
  </Svg>
)
const StyledInProgressSvg = styled(Svg)`
  .spinner_Wezc{
    transform-origin:center;
    animation:spinner_Oiah .75s step-end infinite;
    fill: var(--base);
  }
  @keyframes spinner_Oiah{
    8.3%{transform:rotate(30deg)}
    16.6%{transform:rotate(60deg)}
    25%{transform:rotate(90deg)}
    33.3%{transform:rotate(120deg)}
    41.6%{transform:rotate(150deg)}
    50%{transform:rotate(180deg)}
    58.3%{transform:rotate(210deg)}
    66.6%{transform:rotate(240deg)}
    75%{transform:rotate(270deg)}
    83.3%{transform:rotate(300deg)}
    91.6%{transform:rotate(330deg)}
    100%{transform:rotate(360deg)}
  }
`
export const Running = () => (
  <StyledInProgressSvg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <g className="spinner_Wezc">
      <circle cx="12" cy="2.5" r="1.5" opacity=".14" />
      <circle cx="16.75" cy="3.77" r="1.5" opacity=".29" />
      <circle cx="20.23" cy="7.25" r="1.5" opacity=".43" />
      <circle cx="21.50" cy="12.00" r="1.5" opacity=".57" />
      <circle cx="20.23" cy="16.75" r="1.5" opacity=".71" />
      <circle cx="16.75" cy="20.23" r="1.5" opacity=".86" />
      <circle cx="12" cy="21.5" r="1.5" />
    </g>
  </StyledInProgressSvg>
)
