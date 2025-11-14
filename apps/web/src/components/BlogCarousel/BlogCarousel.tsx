'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { BlogPost } from '@/lib/api';
import { Button } from '../common/Button';
import styles from './BlogCarousel.module.scss';

interface BlogCarouselProps {
  posts: BlogPost[];
}

export const BlogCarousel: React.FC<BlogCarouselProps> = ({ posts }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [posts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      const scrollTo = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={styles.carouselContainer}>
      {canScrollLeft && (
        <button
          className={styles.scrollButton}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <div ref={scrollContainerRef} className={styles.scrollContainer}>
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className={styles.postCard}>
            <div className={styles.imageContainer}>
              {post.imageUrl ? (
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              ) : (
                <div className={styles.placeholder}>No Image</div>
              )}
            </div>
            <div className={styles.content}>
              <h3 className={styles.title}>{post.title}</h3>
              <p className={styles.date}>
                {format(new Date(post.createdAt), 'MMM d, yyyy')}
              </p>
              <p className={styles.summary}>{post.summary}</p>
            </div>
          </Link>
        ))}
      </div>
      {canScrollRight && (
        <button
          className={styles.scrollButton}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
};
