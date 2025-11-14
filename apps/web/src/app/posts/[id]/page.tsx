'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { blogApi } from '@/lib/api';
import styles from './page.module.scss';

export default function PostPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => blogApi.getPost(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>Post not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/posts" className={styles.backLink}>
          ← Back to Posts
        </Link>
      </header>

      <article className={styles.article}>
        {post.imageUrl && (
          <div className={styles.imageContainer}>
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className={styles.image}
              sizes="100vw"
              priority
            />
          </div>
        )}
        <div className={styles.content}>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.date}>
            {format(new Date(post.createdAt), 'MMMM d, yyyy')}
          </p>
          <div
            className={styles.body}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </div>
  );
}
