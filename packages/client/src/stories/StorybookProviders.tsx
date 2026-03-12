import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter } from 'react-router'
import '../styles/tailwind.css'
import '../styles/variables.css'
import '../styles/app-globals.css'
import GlobalStyle from '../styles/global'
import { AlertDismissedProvider } from '../features/admin/alerts/useAlertDismissedLocalStorage'
import { ColorModeProvider } from '../utils/ThemeContext'
import { FileUploadModalProvider } from '../features/files/actionModals/useFileUploadModal/FileUploadModalProvider'
import { OnlineStatusProvider } from '../utils/OnlineStatusContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
    },
  },
})

export function StorybookProviders({ children }: React.PropsWithChildren) {
  return (
    <ColorModeProvider>
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
    </ColorModeProvider>
  )
}
