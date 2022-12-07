/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom/extend-expect'
import 'whatwg-fetch'
import { render, RenderOptions } from '@testing-library/react'
import React, { FC, ReactElement } from 'react'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import queryClient from '../utils/queryClient'

const history = createMemoryHistory()

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider
    client={queryClient({
      onAuthFailure: () => console.log('AuthFailure'),
    })}
  >
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
export { customRender as render, history }
