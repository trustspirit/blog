'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { BlogPost } from '@/lib/api'
import styles from './BlogCarousel.module.scss'

interface BlogCarouselProps {
  posts: BlogPost[]
}

export const BlogCarousel: React.FC<BlogCarouselProps> = ({ posts }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % posts.length)
  }, [posts.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
  }, [posts.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Auto-slide
  useEffect(() => {
    if (isPaused || posts.length <= 1) return

    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isPaused, nextSlide, posts.length])

  if (posts.length === 0) {
    return null
  }

  const currentPost = posts[currentIndex]

  return (
    <div
      className={styles.heroCarousel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.slideContainer}>
        {posts.map((post, index) => (
          <div
            key={post.id}
            className={`${styles.slide} ${
              index === currentIndex ? styles.active : ''
            }`}
          >
            {post.imageUrl ? (
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className={styles.slideImage}
                sizes="100vw"
                priority={index === 0}
              />
            ) : (
              <div className={styles.slidePlaceholder}>
                <div className={styles.placeholderGradient} />
              </div>
            )}
            <div className={styles.overlay} />
          </div>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          {currentPost.tags && currentPost.tags.length > 0 && (
            <div className={styles.tags}>
              {currentPost.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className={styles.title}>{currentPost.title}</h1>
          <p className={styles.summary}>{currentPost.summary}</p>

          <div className={styles.meta}>
            <div className={styles.author}>
              <div className={styles.authorAvatar}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <span>Blog Author</span>
            </div>
            <span className={styles.date}>
              {format(new Date(currentPost.createdAt), 'dd MMM yyyy')}
            </span>
            <span className={styles.readTime}>• 10 mins read</span>
          </div>

          <Link href={`/posts/${currentPost.id}`} className={styles.readMore}>
            Read Article
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {posts.length > 1 && (
        <>
          <button
            className={`${styles.navButton} ${styles.navButtonPrev}`}
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            className={`${styles.navButton} ${styles.navButtonNext}`}
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className={styles.dotNavigation}>
            {posts.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${
                  index === currentIndex ? styles.dotActive : ''
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
