import React from 'react'
import { Slide, ToastContainer } from 'react-toastify'
import { useTheme } from './ThemeContext'

export const PFDAToastContainer = () => {
  const { theme } = useTheme()
  return (
    <ToastContainer
      position="top-right"
      transition={Slide}
      hideProgressBar
      pauseOnHover
      limit={5}
      theme={theme}
    />
  )
}
