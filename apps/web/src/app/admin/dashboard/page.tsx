'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAtomValue } from 'jotai'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { userAtom } from '@/store/auth'
import { blogApi, authApi, BlogPost } from '@/lib/api'
import { Button } from '@/components/common/Button'
import styles from './page.module.scss'

export default function AdminDashboard() {
  const router = useRouter()
  const user = useAtomValue(userAtom)

  const { data: postsData } = useQuery({
    queryKey: ['posts', 'admin'],
    queryFn: () => blogApi.getPosts(1, 100, true),
    enabled: !!user,
  })

  useEffect(() => {
    if (!user) {
      router.push('/admin/login')
    }
  }, [user, router])

  const handleLogout = async () => {
    try {
      await authApi.logout()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Optimize filtering with useMemo to avoid recalculating on every render
  const { publishedPosts, draftPosts } = useMemo(() => {
    const posts: BlogPost[] = postsData?.posts || []
    const published: BlogPost[] = []
    const drafts: BlogPost[] = []

    // Single pass through posts array
    posts.forEach((post) => {
      if (post.published) {
        published.push(post)
      } else {
        drafts.push(post)
      }
    })

    return { publishedPosts: published, draftPosts: drafts }
  }, [postsData?.posts])

  if (!user) {
    return null
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Welcome, {user.name}</p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/posts/new">
            <Button>New Post</Button>
          </Link>
          <Link href="/admin/about">
            <Button variant="secondary">Edit About</Button>
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Published Posts ({publishedPosts.length})
          </h2>
          {publishedPosts.length === 0 ? (
            <p className={styles.empty}>No published posts</p>
          ) : (
            <div className={styles.postsList}>
              {publishedPosts.map((post) => (
                <div key={post.id} className={styles.postItem}>
                  <div className={styles.postInfo}>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <p className={styles.postDate}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/admin/posts/${post.id}`}>
                    <Button size="small">Edit</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Drafts ({draftPosts.length})</h2>
          {draftPosts.length === 0 ? (
            <p className={styles.empty}>No drafts</p>
          ) : (
            <div className={styles.postsList}>
              {draftPosts.map((post) => (
                <div key={post.id} className={styles.postItem}>
                  <div className={styles.postInfo}>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <p className={styles.postDate}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/admin/posts/${post.id}`}>
                    <Button size="small">Edit</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
