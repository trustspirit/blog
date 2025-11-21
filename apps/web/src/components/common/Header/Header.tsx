'use client'

import React from 'react'
import Link from 'next/link'
import { SearchBar } from '../SearchBar'
import styles from './Header.module.scss'

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
                fontFamily="Arial, sans-serif"
              >
                TJ
              </text>
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
          <span className={styles.logoText}>TrustJ</span>
        </Link>

        <nav className={styles.nav}>
          <div className={styles.searchWrapper}>
            <SearchBar isScrolled={isScrolled} />
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
