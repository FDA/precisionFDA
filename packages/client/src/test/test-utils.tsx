/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom'
import 'whatwg-fetch'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { FC } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'
import {
  QueryClientProvider,
  QueryClient,
  QueryCache,
} from '@tanstack/react-query'
import { server } from '../mocks/server'
import { AlertDismissedProvider } from '../features/admin/alerts/useAlertDismissedLocalStorage'

const queryCache = new QueryCache()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: Infinity,
    },
  },
})

export const AllTheProviders: FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <AlertDismissedProvider>
          {children}
        </AlertDismissedProvider>
      </QueryParamProvider>
    </QueryClientProvider>
  </BrowserRouter>
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
