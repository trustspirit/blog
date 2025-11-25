import { Metadata } from 'next'
import { dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/get-query-client'
import { postQueries } from '@/lib/queries'
import { HomeContent } from '@/components/HomeContent'

export const metadata: Metadata = {
  title: 'Personal Blog | Travel Stories & Guides',
  description:
    'Discover amazing travel stories, guides, and tips from around the world.',
  openGraph: {
    title: 'Personal Blog | Travel Stories & Guides',
    description:
      'Discover amazing travel stories, guides, and tips from around the world.',
    type: 'website',
  },
}

// ISR: Revalidate every 60 seconds
export const revalidate = 60

// Server Component - prefetch data on the server
export default async function Home() {
  const queryClient = getQueryClient()

  // Prefetch posts data
  try {
    await queryClient.prefetchQuery(postQueries.all(1, 20, false))
  } catch (error) {
    // If prefetch fails, client will handle fallback to dummy data
    console.error('Failed to prefetch posts:', error)
  }

  const dehydratedState = dehydrate(queryClient)

  return <HomeContent dehydratedState={dehydratedState} />
}
