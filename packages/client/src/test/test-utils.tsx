import { render as browserRender } from 'vitest-browser-react'
import { page } from 'vitest/browser'
import { FC } from 'react'
import { BrowserRouter } from 'react-router'
import { QueryClientProvider, QueryClient, QueryCache } from '@tanstack/react-query'
import { AlertDismissedProvider } from '../features/admin/alerts/useAlertDismissedLocalStorage'
import { ColorModeProvider } from '../utils/ThemeContext'

const queryCache = new QueryCache()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
    },
  },
})

export const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => (
  <ColorModeProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AlertDismissedProvider>{children}</AlertDismissedProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ColorModeProvider>
)

const customRender = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  browserRender(
    <AllTheProviders>
      {ui}
    </AllTheProviders>
  )
  // Return the page object for querying elements
  return page
}

export { customRender as render }
