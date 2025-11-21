'use client'

import React, { useState, useMemo } from 'react'
import { BlogPost } from '@/lib/api'
import { BlogCard } from '../BlogCard'
import styles from './BlogGrid.module.scss'

interface BlogGridProps {
  posts: BlogPost[]
}

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
]

export const BlogGrid: React.FC<BlogGridProps> = ({ posts }) => {
  const [selectedTag, setSelectedTag] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  // Extract all unique tags from posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach((post) => {
      post.tags?.forEach((tag) => tagSet.add(tag))
    })
    return ['All', ...Array.from(tagSet).sort()]
  }, [posts])

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let result = [...posts]

    // Filter by tag
    if (selectedTag !== 'All') {
      result = result.filter((post) => post.tags?.includes(selectedTag))
    }

    // Sort posts
    if (sortBy === 'newest') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    } else if (sortBy === 'oldest') {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
    }

    return result
  }, [posts, selectedTag, sortBy])

  return (
    <section className={styles.blogSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>Blog</h2>
          <p className={styles.sectionDescription}>
            Here, we share travel tips, destination guides, and stories that
            inspire your next adventure.
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.categoryTabs}>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`${styles.categoryTab} ${
                  selectedTag === tag ? styles.categoryTabActive : ''
                }`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className={styles.sortControl}>
            <label htmlFor="sort" className={styles.sortLabel}>
              Sort by:
            </label>
            <select
              id="sort"
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className={styles.grid}>
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>No blog posts found with the selected tag.</p>
          </div>
        )}
      </div>
    </section>
  )
}
