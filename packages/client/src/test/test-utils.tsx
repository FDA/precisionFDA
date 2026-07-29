import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FC } from 'react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { page } from 'vitest/browser'
import { render as browserRender } from 'vitest-browser-react'
import { AlertDismissedProvider } from '../features/admin/alerts/useAlertDismissedLocalStorage'
import { FileUploadModalProvider } from '../features/files/actionModals/useFileUploadModal/FileUploadModalProvider'
import { OnlineStatusProvider } from '../utils/OnlineStatusContext'
import { ThemeProvider } from '../utils/ThemeContext'

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
    <QueryClientProvider client={queryClient}>
      <AlertDismissedProvider>
        <OnlineStatusProvider>
          <FileUploadModalProvider>{children}</FileUploadModalProvider>
        </OnlineStatusProvider>
      </AlertDismissedProvider>
    </QueryClientProvider>
  </ThemeProvider>
)

const customRender = (ui: React.ReactElement, { route = '/' } = {}) => {
  ensureModalRoot()
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: <AllTheProviders>{ui}</AllTheProviders>,
      },
    ],
    { initialEntries: [route] },
  )
  browserRender(<RouterProvider router={router} />)
  // Return the page object for querying elements
  return page
}

export const setAuthenticatedSession = () => {
  document.cookie = 'sessionExpiredAt=9999999999999; path=/'
}

export { customRender as render }
