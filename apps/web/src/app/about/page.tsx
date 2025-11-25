import { Metadata } from 'next'
import { dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/get-query-client'
import { aboutQueries } from '@/lib/queries'
import { AboutContent } from '@/components/AboutContent'

export const metadata: Metadata = {
  title: 'About | Personal Blog',
  description: 'Learn more about this blog and its author.',
}

// ISR: Revalidate every 60 seconds
export const revalidate = 60

// Server Component - prefetch data on the server
export default async function AboutPage() {
  const queryClient = getQueryClient()

  // Prefetch about data
  try {
    await queryClient.prefetchQuery(aboutQueries.all())
  } catch (error) {
    // If prefetch fails, client will handle fallback
    console.error('Failed to prefetch about content:', error)
  }

  const dehydratedState = dehydrate(queryClient)

  return <AboutContent dehydratedState={dehydratedState} />
}
