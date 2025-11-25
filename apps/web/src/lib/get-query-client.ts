import { QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

// Create a query client that's shared across requests
// This ensures data isn't shared between users and requests
export const getQueryClient = cache(() => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  })
})
