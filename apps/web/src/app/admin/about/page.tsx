'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAtomValue } from 'jotai';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAtom } from '@/store/auth';
import { blogApi } from '@/lib/api';
import { Button } from '@/components/common/Button';
import { RichTextEditor } from '@/components/RichTextEditor';
import styles from './page.module.scss';

export default function EditAboutPage() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { data: about, isLoading } = useQuery({
    queryKey: ['about'],
    queryFn: () => blogApi.getAbout(),
  });

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (about) {
      setContent(about.content || '');
    }
  }, [about]);

  const updateMutation = useMutation({
    mutationFn: (newContent: string) => blogApi.updateAbout(newContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about'] });
      router.push('/admin/dashboard');
    },
  });

  const handleSave = () => {
    updateMutation.mutate(content);
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Edit About</h1>
        <Link href="/admin/dashboard" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.editorContainer}>
          <label className={styles.label}>About Content</label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write about yourself..."
          />
        </div>

        <div className={styles.actions}>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </main>
    </div>
  );
}
