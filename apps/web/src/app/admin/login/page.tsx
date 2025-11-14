'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSetAtom } from 'jotai'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { userAtom } from '@/store/auth'
import { Button } from '@/components/common/Button'
import styles from './page.module.scss'

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any
        }
      }
    }
  }
}

export default function AdminLoginPage() {
  const router = useRouter()
  const setUser = useSetAtom(userAtom)
  const [isLoading, setIsLoading] = useState(false)

  const loginMutation = useMutation({
    mutationFn: authApi.loginWithGoogle,
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
      }
      setUser(data.user)
      router.push('/admin/dashboard')
    },
    onError: (error) => {
      console.error('Login failed:', error)
      alert('Login failed. Please try again.')
      setIsLoading(false)
    },
  })

  const handleGoogleLogin = () => {
    if (!window.google) {
      alert('Google Sign-In is not available. Please check your configuration.')
      return
    }

    setIsLoading(true)
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      scope: 'email profile',
      callback: (response: any) => {
        if (response.access_token) {
          loginMutation.mutate(response.access_token)
        } else {
          setIsLoading(false)
        }
      },
    })

    client.requestAccessToken()
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subtitle}>
          Sign in with Google to manage your blog
        </p>
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          size="large"
          fullWidth
          className={styles.loginButton}
        >
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
