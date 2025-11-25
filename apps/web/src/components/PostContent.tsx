'use client'

import {
  useQuery,
  HydrationBoundary,
  DehydratedState,
} from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { useMemo } from 'react'
import parse from 'html-react-parser'
import { postQueries } from '@/lib/queries'
import { embedYouTubeVideos } from '@/lib/youtube'
import styles from '../app/posts/[id]/page.module.scss'

interface PostContentProps {
  dehydratedState?: DehydratedState
}

export function PostContent({ dehydratedState }: PostContentProps) {
  const params = useParams()
  const id = params.id as string

  const { data: post, isLoading } = useQuery(postQueries.detail(id))

  // Use useMemo to avoid recalculating on every render
  const processedContent = useMemo(() => {
    if (!post?.content) return ''
    return embedYouTubeVideos(post.content)
  }, [post?.content])

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading post...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>Post not found</div>
      </div>
    )
  }

  const content = (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/posts" className={styles.backLink}>
          ← Back to Posts
        </Link>
      </header>

      <article className={styles.article}>
        {post.imageUrl && (
          <div className={styles.imageContainer}>
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className={styles.image}
              sizes="100vw"
              priority
            />
          </div>
        )}
        <div className={styles.content}>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.date}>
            {format(new Date(post.createdAt), 'MMMM d, yyyy')}
          </p>
          <div className={styles.body}>{parse(processedContent)}</div>
        </div>
      </article>
    </div>
  )

  if (dehydratedState) {
    return (
      <HydrationBoundary state={dehydratedState}>{content}</HydrationBoundary>
    )
  }

  return content
}
