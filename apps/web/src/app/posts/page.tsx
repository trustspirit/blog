'use client';

import { useMemo, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { blogApi, BlogPost } from '@/lib/api';
import styles from './page.module.scss';

export default function PostsPage() {
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['posts', 'all'],
    queryFn: ({ pageParam = 1 }) => blogApi.getPosts(pageParam, 10, false),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Use useMemo to avoid recalculating on every render
  const posts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.posts || []);
  }, [data?.pages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading posts...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>
        <h1 className={styles.title}>All Posts</h1>
      </header>

      <main className={styles.main}>
        {posts.length === 0 ? (
          <div className={styles.empty}>No posts found</div>
        ) : (
          <div className={styles.postsGrid}>
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
                  <h2 className={styles.postTitle}>{post.title}</h2>
                  <p className={styles.date}>
                    {format(new Date(post.createdAt), 'MMM d, yyyy')}
                  </p>
                  <p className={styles.summary}>{post.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div ref={observerTarget} className={styles.observerTarget}>
          {isFetchingNextPage && (
            <div className={styles.loadingMore}>Loading more posts...</div>
          )}
        </div>
      </main>
    </div>
  );
}
