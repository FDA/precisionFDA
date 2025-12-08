import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter } from 'react-router'
import GlobalStyle from '../styles/global'
import { AlertDismissedProvider } from '../features/admin/alerts/useAlertDismissedLocalStorage'
import { ColorModeProvider } from '../utils/ThemeContext'

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
            {children}
          </AlertDismissedProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ColorModeProvider>
  )
}
