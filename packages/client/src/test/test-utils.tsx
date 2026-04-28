import { render as browserRender } from 'vitest-browser-react'
import { page } from 'vitest/browser'
import { FC } from 'react'
import { BrowserRouter } from 'react-router'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { AlertDismissedProvider } from '../features/admin/alerts/useAlertDismissedLocalStorage'
import { ThemeProvider } from '../utils/ThemeContext'
import { OnlineStatusProvider } from '../utils/OnlineStatusContext'
import { FileUploadModalProvider } from '../features/files/actionModals/useFileUploadModal/FileUploadModalProvider'

// Ensure modal-root element exists for portal-based modals
const ensureModalRoot = () => {
  if (!document.getElementById('modal-root')) {
    const modalRoot = document.createElement('div')
    modalRoot.setAttribute('id', 'modal-root')
    document.body.appendChild(modalRoot)
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
    },
  },
})

export const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <BrowserRouter>
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

const customRender = (ui: React.ReactElement, { route = '/' } = {}) => {
  ensureModalRoot()
  window.history.pushState({}, 'Test page', route)
  browserRender(
    <AllTheProviders>
      {ui}
    </AllTheProviders>,
  )
  // Return the page object for querying elements
  return page
}

export const setAuthenticatedSession = () => {
  document.cookie = 'sessionExpiredAt=9999999999999; path=/'
}

export { customRender as render }
