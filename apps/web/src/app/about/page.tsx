'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { blogApi } from '@/lib/api'
import styles from './page.module.scss'

export default function AboutPage() {
  const { data: about, isLoading } = useQuery({
    queryKey: ['about'],
    queryFn: () => blogApi.getAbout(),
  })

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>
        <h1 className={styles.title}>About</h1>
      </header>

      <main className={styles.main}>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{
            __html: about?.content || '<p>No information available.</p>',
          }}
        />
      </main>
    </div>
  )
}
