import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { Router } from 'react-router'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5'
import GlobalStyle from '../styles/global'
import history from '../utils/history'
import queryClient from '../utils/queryClient'

export function StorybookProviders({ children }: React.PropsWithChildren) {
  return (
    <QueryClientProvider
      client={queryClient({
        onAuthFailure: () => console.log('AuthFailure'),
      })}
    >
      <Router history={history}>
        <QueryParamProvider adapter={ReactRouter5Adapter}>
          <>
            <GlobalStyle />
            {children}
          </>
        </QueryParamProvider>
      </Router>
    </QueryClientProvider>
  )
}
