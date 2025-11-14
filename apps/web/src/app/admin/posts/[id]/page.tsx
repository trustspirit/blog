"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAtom } from "@/store/auth";
import { blogApi, CreateBlogPostDto, UpdateBlogPostDto } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { TextField } from "@/components/common/TextField";
import { TextArea } from "@/components/common/TextArea";
import { RichTextEditor } from "@/components/RichTextEditor";
import styles from "./page.module.scss";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();
  const id = params.id as string;
  const isNew = id === "new";

  const [formData, setFormData] = useState<CreateBlogPostDto>({
    title: "",
    content: "",
    summary: "",
    imageUrl: "",
    published: false,
  });

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", "admin", id],
    queryFn: () => blogApi.getPostForAdmin(id),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (!user) {
      router.push("/admin/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (post && !isNew) {
      setFormData({
        title: post.title,
        content: post.content,
        summary: post.summary,
        imageUrl: post.imageUrl,
        published: post.published,
      });
    }
  }, [post, isNew]);

  const saveMutation = useMutation({
    mutationFn: (data: CreateBlogPostDto | UpdateBlogPostDto) => {
      if (isNew) {
        return blogApi.createPost(data as CreateBlogPostDto);
      }
      return blogApi.updatePost(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push("/admin/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleSaveDraft = () => {
    saveMutation.mutate({ ...formData, published: false });
  };

  const handlePublish = () => {
    saveMutation.mutate({ ...formData, published: true });
  };

  if (!user) {
    return null;
  }

  if (!isNew && isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{isNew ? "New Post" : "Edit Post"}</h1>
        <Link href="/admin/dashboard" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            fullWidth
          />

          <TextField
            label="Image URL"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            fullWidth
          />

          <TextArea
            label="Summary"
            value={formData.summary}
            onChange={(e) =>
              setFormData({ ...formData, summary: e.target.value })
            }
            placeholder="Brief summary of the post (3-4 lines)"
            rows={4}
            fullWidth
          />

          <div className={styles.editorContainer}>
            <label className={styles.label}>Content</label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
            />
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={saveMutation.isPending}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={handlePublish}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
