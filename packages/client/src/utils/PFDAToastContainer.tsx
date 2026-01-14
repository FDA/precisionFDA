import React from 'react'
import { ToastContainer } from 'react-toastify'
import { useTheme } from './ThemeContext'

export const PFDAToastContainer = () => {
  const { theme } = useTheme()
  return (
    <ToastContainer
      position="top-right"
      stacked
      closeOnClick
      pauseOnHover
      limit={5}
      theme={theme}
      toastStyle={{
        marginTop: '40px',
        paddingRight: '25px',
        width: '400px',
      }}
    />
  )
}
