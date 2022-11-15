/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom/extend-expect'
import 'whatwg-fetch'
import { render, RenderOptions } from '@testing-library/react'
import React, { FC, ReactElement } from 'react'
import { QueryParamProvider } from 'use-query-params'
import { QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import queryClient from '../utils/queryClient'
import store from '../store'

const history = createMemoryHistory()

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={store}>
    <QueryClientProvider
      client={queryClient({
        onAuthFailure: () => console.log('AuthFailure'),
      })}
    >
      <Router history={history}>
        <QueryParamProvider>
          {children}
        </QueryParamProvider>
      </Router>
    </QueryClientProvider>
  </Provider>
)

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render, history }
