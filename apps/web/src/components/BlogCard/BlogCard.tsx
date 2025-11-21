'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { BlogPost } from '@/lib/api'
import styles from './BlogCard.module.scss'

interface BlogCardProps {
  post: BlogPost
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <Link href={`/posts/${post.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.placeholderGradient} />
          </div>
        )}
        <span className={styles.category}>Destination</span>
      </div>

      <div className={styles.content}>
        {post.tags && post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.summary}>{post.summary}</p>
        <div className={styles.meta}>
          <span className={styles.date}>
            {format(new Date(post.createdAt), 'MMM dd, yyyy')}
          </span>
          {post.readingTime && (
            <span className={styles.readTime}>
              • {post.readingTime} min read
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
