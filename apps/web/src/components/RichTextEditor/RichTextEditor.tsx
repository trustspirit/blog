'use client'

import React, { useMemo, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { blogApi } from '@/lib/api'
import styles from './RichTextEditor.module.scss'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
  className,
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const quillInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Get Quill instance from the editor element after ReactQuill mounts
    // Only run once on mount, not on every value change
    const timer = setTimeout(() => {
      if (editorRef.current) {
        const quillEditor = editorRef.current.querySelector('.ql-editor')
        if (quillEditor) {
          // Access Quill through the global Quill instance
          // ReactQuill exposes Quill globally when loaded
          const Quill = (window as any).Quill
          if (Quill) {
            const quill = Quill.find(quillEditor)
            if (quill) {
              quillInstanceRef.current = quill
            }
          }
        }
      }
    }, 100) // Small delay to ensure ReactQuill is fully mounted

    return () => clearTimeout(timer)
  }, []) // Empty dependency array - only run on mount

  const imageHandler = useCallback(async () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')

    // Clean up input element after use
    const cleanup = () => {
      input.remove()
    }

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        cleanup()
        return
      }

      // Get the Quill editor instance
      let quill = quillInstanceRef.current

      // If not found in ref, try to find it from the DOM
      if (!quill && editorRef.current) {
        const quillEditor = editorRef.current.querySelector('.ql-editor')
        if (quillEditor && (window as any).Quill) {
          quill = (window as any).Quill.find(quillEditor)
        }
      }

      if (!quill) {
        console.error('Quill editor instance not found')
        cleanup()
        return
      }

      const range = quill.getSelection()
      const index = range ? range.index : 0

      // Insert placeholder
      quill.insertEmbed(
        index,
        'image',
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      )
      quill.setSelection(index + 1)

      try {
        // Upload image
        const imageUrl = await blogApi.uploadImage(file)

        // Replace placeholder with actual image
        quill.deleteText(index, 1)
        quill.insertEmbed(index, 'image', imageUrl)
        quill.setSelection(index + 1)
      } catch (error) {
        // Remove placeholder on error
        quill.deleteText(index, 1)
        console.error('Failed to upload image:', error)
        // Use a more user-friendly error notification
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        alert(`Failed to upload image: ${errorMessage}`)
      } finally {
        cleanup()
      }
    }

    input.click()
  }, [])

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler],
  )

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
  ]

  return (
    <div className={styles.container} ref={editorRef}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className={className}
      />
    </div>
  )
}
