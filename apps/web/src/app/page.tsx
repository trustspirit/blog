'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { blogApi } from '@/lib/api'
import { BlogCarousel } from '@/components/BlogCarousel'
import { Button } from '@/components/common/Button'
import { ThemeToggle } from '@/components/ThemeToggle'
import styles from './page.module.scss'

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['posts', 'recent'],
    queryFn: () => blogApi.getPosts(1, 10, false),
  })

  const posts = data?.posts || []

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Blog</h1>
        <nav className={styles.nav}>
          <Link href="/posts" className={styles.navLink}>
            All Posts
          </Link>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
          <Link href="/admin/login" className={styles.navLink}>
            Admin
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h2 className={styles.heroTitle}>Latest Posts</h2>
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : posts.length > 0 ? (
            <BlogCarousel posts={posts} />
          ) : (
            <div className={styles.empty}>No posts yet</div>
          )}
        </section>

        <div className={styles.actions}>
          <Link href="/posts">
            <Button size="large">View All Posts</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
