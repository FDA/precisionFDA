/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom/extend-expect'
import 'whatwg-fetch'
import { render, RenderOptions } from '@testing-library/react'
import React, { FC, ReactElement } from 'react'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5'
import { QueryClientProvider, QueryClient, QueryCache } from '@tanstack/react-query'
import { Router } from 'react-router-dom'
import { server } from '../mocks/server'
import history from '../utils/history'

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
  <QueryClientProvider client={queryClient}>
    <Router history={history}>
      <QueryParamProvider adapter={ReactRouter5Adapter}>
        {children}
      </QueryParamProvider>
    </Router>
  </QueryClientProvider>
)

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryCache.clear()
  queryClient.cancelQueries()
})
afterAll(() => server.close())

export { customRender as render, history }
