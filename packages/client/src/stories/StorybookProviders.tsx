import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'
import GlobalStyle from '../styles/global'
import { AlertDismissedProvider } from '../features/admin/alerts/useAlertDismissedLocalStorage'
import { NavOrderProvider } from '../components/Header/useNavOrderLocalStorage'
import { NavFavoritesProvider } from '../components/Header/useNavFavoritesLocalStorage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: Infinity,
    },
  },
})

export function StorybookProviders({ children }: React.PropsWithChildren) {
  return (
    <BrowserRouter>
      <GlobalStyle railsAlertHeight={0} />
      <QueryClientProvider client={queryClient}>
        <AlertDismissedProvider>
          <NavOrderProvider>
            <NavFavoritesProvider>
              <QueryParamProvider adapter={ReactRouter6Adapter}>{children}</QueryParamProvider>
            </NavFavoritesProvider>
          </NavOrderProvider>
        </AlertDismissedProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
