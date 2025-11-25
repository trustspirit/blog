'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/lib/api'
import { postQueries } from '@/lib/queries'
import { searchDummyPosts } from '@/lib/dummyData'
import styles from './SearchBar.module.scss'

interface SearchBarProps {
  isScrolled?: boolean
}

export const SearchBar: React.FC<SearchBarProps> = ({ isScrolled = false }) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const { data: results = [], isFetching } = useQuery({
    queryKey: postQueries.search(query, 5).queryKey,
    queryFn: async () => {
      try {
        return await blogApi.searchPosts(query, 5)
      } catch (error) {
        // Fallback to dummy data if API fails
        return await searchDummyPosts(query)
      }
    },
    enabled: query.length > 0,
    staleTime: 30000,
    retry: false,
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToPost(results[selectedIndex].id)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const navigateToPost = (id: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(`/posts/${id}`)
  }

  return (
    <div
      ref={searchRef}
      className={`${styles.searchContainer} ${
        !isScrolled ? styles.transparent : ''
      }`}
    >
      <div className={styles.searchInputWrapper}>
        <svg
          className={styles.searchIcon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Search blog posts..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
        />
        {isFetching && (
          <div className={styles.spinner}>
            <div className={styles.spinnerIcon} />
          </div>
        )}
      </div>

      {isOpen && query && (results.length > 0 || !isFetching) && (
        <div className={styles.searchResults}>
          {results.length > 0 ? (
            <>
              {results.map((post, index) => (
                <button
                  key={post.id}
                  className={`${styles.resultItem} ${
                    index === selectedIndex ? styles.selected : ''
                  }`}
                  onClick={() => navigateToPost(post.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={styles.resultContent}>
                    <h4 className={styles.resultTitle}>{post.title}</h4>
                    {post.summary && (
                      <p className={styles.resultSummary}>{post.summary}</p>
                    )}
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className={styles.noResults}>
              <p>No posts found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
