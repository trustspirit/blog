import { Metadata } from 'next'
import { dehydrate } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { getQueryClient } from '@/lib/get-query-client'
import { postQueries } from '@/lib/queries'
import { PostContent } from '@/components/PostContent'

interface PageProps {
  params: {
    id: string
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const queryClient = getQueryClient()

  try {
    // Fetch post for metadata
    const post = await queryClient.fetchQuery(postQueries.detail(params.id))

    return {
      title: `${post.title} | Personal Blog`,
      description: post.summary,
      openGraph: {
        title: post.title,
        description: post.summary,
        images: post.imageUrl ? [post.imageUrl] : [],
        type: 'article',
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        tags: post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.summary,
        images: post.imageUrl ? [post.imageUrl] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Post Not Found | Personal Blog',
    }
  }
}

// ISR: Revalidate every 60 seconds
export const revalidate = 60

// Server Component - prefetch data on the server
export default async function PostPage({ params }: PageProps) {
  const queryClient = getQueryClient()

  // Prefetch post data
  try {
    await queryClient.prefetchQuery(postQueries.detail(params.id))
  } catch (error) {
    // If post doesn't exist, show 404
    notFound()
  }

  const dehydratedState = dehydrate(queryClient)

  return <PostContent dehydratedState={dehydratedState} />
}
