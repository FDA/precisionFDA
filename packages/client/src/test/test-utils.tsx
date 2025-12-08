import '@testing-library/jest-dom'
import 'whatwg-fetch'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { FC } from 'react'
import { BrowserRouter } from 'react-router'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { server } from '../mocks/server'
import { AlertDismissedProvider } from '../features/admin/alerts/useAlertDismissedLocalStorage'
import { ColorModeProvider } from '../utils/ThemeContext'

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

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
  return render(ui, { wrapper: AllTheProviders })
}

export * from '@testing-library/react'

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryCache.clear()
  queryClient.cancelQueries()
})
afterAll(() => server.close())

export { customRender as render, userEvent }
