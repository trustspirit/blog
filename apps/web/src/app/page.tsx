'use client'

import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/lib/api'
import { DUMMY_POSTS } from '@/lib/dummyData'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { BlogCarousel } from '@/components/BlogCarousel'
import { BlogGrid } from '@/components/BlogGrid'
import styles from './page.module.scss'

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', 'all'],
    queryFn: () => blogApi.getPosts(1, 20, false),
    retry: false, // Don't retry if API fails
  })

  // Use dummy data if API fails or in development without DB
  const useDummyData =
    error || (!isLoading && (!data || data.posts.length === 0))
  const posts = useDummyData ? DUMMY_POSTS : data?.posts || []

  const featuredPosts = posts.slice(0, 5)
  const gridPosts = posts

  return (
    <div className={styles.container}>
      <Header />

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading amazing content...</p>
        </div>
      ) : (
        <>
          {featuredPosts.length > 0 && (
            <section className={styles.heroSection}>
              <BlogCarousel posts={featuredPosts} />
            </section>
          )}

          {gridPosts.length > 0 && <BlogGrid posts={gridPosts} />}

          {posts.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyContent}>
                <h2>No Posts Yet</h2>
                <p>Check back soon for exciting travel stories and guides!</p>
              </div>
            </div>
          )}
        </>
      )}

      <Footer />
    </div>
  )
}
