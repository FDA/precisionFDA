import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren, useState } from 'react'
import { BrowserRouter } from 'react-router'
import '../styles/tailwind.css'
import '../styles/variables.css'
import '../styles/app-globals.css'
import { AlertDismissedProvider } from '../features/admin/alerts/useAlertDismissedLocalStorage'
import { FileUploadModalProvider } from '../features/files/actionModals/useFileUploadModal/FileUploadModalProvider'
import GlobalStyle from '../styles/global'
import { OnlineStatusProvider } from '../utils/OnlineStatusContext'
import { ThemeProvider } from '../utils/ThemeContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
    },
  },
})

export function resetStorybookQueryClient() {
  queryClient.clear()
}

export function StorybookProviders({ children }: PropsWithChildren) {
  useState(() => {
    resetStorybookQueryClient()
    return true
  })

  return (
    <ThemeProvider>
      <BrowserRouter>
        <GlobalStyle railsAlertHeight={0} />
        <QueryClientProvider client={queryClient}>
          <AlertDismissedProvider>
            <OnlineStatusProvider>
              <FileUploadModalProvider>{children}</FileUploadModalProvider>
            </OnlineStatusProvider>
          </AlertDismissedProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
