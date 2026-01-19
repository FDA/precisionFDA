import { QueryClient } from '@tanstack/react-query'

const queryClient = ({ onAuthFailure }: { onAuthFailure: () => void }) =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // We disable refetching on focus as it can extend the session without user input
        refetchOnWindowFocus: false,
        onSuccess: (res: any) => {
          // Catch if cookie expired
          // if(!IS_DEV) {
          if (res?.failure === 'Authentication failure') {
            onAuthFailure()
          }
          // }
        },
      },
    },
  })

export default queryClient
