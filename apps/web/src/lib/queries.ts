import { queryOptions } from '@tanstack/react-query'
import { blogApi, authApi } from './api'

// Query Key Factory
export const queryKeys = {
  posts: {
    all: ['posts', 'all'] as const,
    detail: (id: string) => ['post', id] as const,
    admin: (id: string) => ['post', 'admin', id] as const,
    search: (query: string, limit?: number) =>
      ['posts', 'search', query, limit] as const,
  },
  about: {
    all: ['about'] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
} as const

// Query Options
// Note: staleTime defaults to 60 * 1000 (1 minute) from QueryClient defaultOptions
// Only override when different value is needed
export const postQueries = {
  all: (page: number = 1, limit: number = 20, includeDrafts: boolean = false) =>
    queryOptions({
      queryKey: queryKeys.posts.all,
      queryFn: () => blogApi.getPosts(page, limit, includeDrafts),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.posts.detail(id),
      queryFn: () => blogApi.getPost(id),
      enabled: !!id,
    }),

  admin: (id: string) =>
    queryOptions({
      queryKey: queryKeys.posts.admin(id),
      queryFn: () => blogApi.getPostForAdmin(id),
      enabled: !!id,
    }),

  search: (query: string, limit: number = 10) =>
    queryOptions({
      queryKey: queryKeys.posts.search(query, limit),
      queryFn: () => blogApi.searchPosts(query, limit),
      enabled: !!query && query.length > 0,
      staleTime: 30 * 1000, // 30 seconds for search (shorter cache)
    }),
}

export const aboutQueries = {
  all: () =>
    queryOptions({
      queryKey: queryKeys.about.all,
      queryFn: () => blogApi.getAbout(),
    }),
}

export const authQueries = {
  me: () =>
    queryOptions({
      queryKey: queryKeys.auth.me,
      queryFn: () => authApi.getMe(),
      staleTime: 5 * 60 * 1000, // 5 minutes (longer cache for auth)
      retry: false,
    }),
}
