'use client'

import React from 'react'
import Link from 'next/link'
import { SearchBar } from '../SearchBar'
import styles from './Header.module.scss'

export const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
              <path
                d="M16 8L20 16L16 24L12 16L16 8Z"
                fill="white"
                opacity="0.9"
              />
              <defs>
                <linearGradient
                  id="logo-gradient"
                  x1="0"
                  y1="0"
                  x2="32"
                  y2="32"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#667eea" />
                  <stop offset="1" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className={styles.logoText}>Horizone</span>
        </Link>

        <nav className={styles.nav}>
          <div className={styles.searchWrapper}>
            <SearchBar />
          </div>

          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              Home
            </Link>
            <Link href="/posts" className={styles.navLink}>
              Blog
            </Link>
            <Link href="/about" className={styles.navLink}>
              About
            </Link>
            <Link href="/admin/login" className={styles.adminButton}>
              Admin Login
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
