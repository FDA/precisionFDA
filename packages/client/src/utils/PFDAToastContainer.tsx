import React from 'react'
import { ToastContainer, toast } from 'react-toastify'
import styled from 'styled-components'
import { CloseAllIcon } from '../components/icons/CloseAllIcon'
import { useTheme } from './ThemeContext'
import { colors } from '../styles/theme'

const CloseButtonContainer = styled.div`
  position: absolute;
  top: 6px;
  right: 0;
  z-index: 10;
`

const CloseButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;

  &:hover {
    background: transparent;
    color: ${colors.primaryRed};
    transform: scale(1.1);
  }

  /* Dark theme adjustments */

  .Toastify__toast--dark & {
    background: rgba(0, 0, 0, 0.4);

    &:hover {
      background: rgba(0, 0, 0, 0.6);
    }
  }
`

const CloseAllButton = () => {
  return (
    <CloseButtonContainer>
      <CloseButton onClick={() => toast.dismiss()} title="Close all notifications" aria-label="Close all notifications">
        <CloseAllIcon width={25} height={25} />
      </CloseButton>
    </CloseButtonContainer>
  )
}

export const PFDAToastContainer = () => {
  const { theme } = useTheme()
  return (
    <ToastContainer
      position="top-right"
      closeOnClick
      pauseOnHover
      limit={5}
      theme={theme}
      closeButton={CloseAllButton}
      toastStyle={{
        paddingRight: '25px',
        width: '400px',
      }}
    />
  )
}
