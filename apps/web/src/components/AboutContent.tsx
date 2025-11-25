'use client'

import {
  useQuery,
  HydrationBoundary,
  DehydratedState,
} from '@tanstack/react-query'
import Link from 'next/link'
import parse from 'html-react-parser'
import { aboutQueries } from '@/lib/queries'
import styles from '../app/about/page.module.scss'

interface AboutContentProps {
  dehydratedState?: DehydratedState
}

export function AboutContent({ dehydratedState }: AboutContentProps) {
  const { data: about, isLoading } = useQuery(aboutQueries.all())

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  const content = (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>
        <h1 className={styles.title}>About</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          {parse(about?.content || '<p>No information available.</p>')}
        </div>
      </main>
    </div>
  )

  if (dehydratedState) {
    return (
      <HydrationBoundary state={dehydratedState}>{content}</HydrationBoundary>
    )
  }

  return content
}
