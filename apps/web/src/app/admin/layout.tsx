'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useAtomValue, useSetAtom } from 'jotai'
import { useQuery } from '@tanstack/react-query'
import { userAtom } from '@/store/auth'
import { authApi } from '@/lib/api'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const user = useAtomValue(userAtom)
  const setUser = useSetAtom(userAtom)
  const isLoginPage = pathname === '/admin/login'

  const { data: meData } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled:
      !isLoginPage &&
      typeof window !== 'undefined' &&
      !!localStorage.getItem('accessToken'),
    retry: false,
  })

  useEffect(() => {
    if (meData) {
      setUser(meData)
    }
  }, [meData, setUser])

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoginPage) {
      const token = localStorage.getItem('accessToken')
      if (!token && !user) {
        window.location.href = '/admin/login'
      }
    }
  }, [user, isLoginPage])

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
      />
      {children}
    </>
  )
}
