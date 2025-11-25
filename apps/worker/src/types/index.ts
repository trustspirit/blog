export interface Env {
  JWT_SECRET: string
  GOOGLE_CLIENT_ID: string
  ADMIN_EMAILS: string // comma-separated
  FIREBASE_PROJECT_ID: string
  FIREBASE_SERVICE_ACCOUNT: string
  CLOUDFLARE_ACCOUNT_ID: string
  CLOUDFLARE_IMAGES_API_TOKEN: string
  CLOUDFLARE_IMAGES_VARIANT?: string // Optional: variant name (default: 'public')
  MONGODB_URI: string
  FRONTEND_URL: string
}

export interface User {
  id: string
  email: string
  name: string
  picture: string
  createdAt?: string
  lastLoginAt?: string
}

export interface Post {
  id: string
  title: string
  content: string
  summary: string
  imageUrl?: string
  published: boolean
  authorId: string
  createdAt: string
  updatedAt: string
}

export interface About {
  id: string
  slug: string
  content: string
  updatedAt: string
}

export interface GoogleLoginRequest {
  token: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface CreatePostRequest {
  title: string
  content: string
  summary: string
  imageUrl?: string
  published?: boolean
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  summary?: string
  imageUrl?: string
  published?: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface TokenResponse {
  accessToken: string
}

export interface MessageResponse {
  message: string
}

export interface PostsResponse {
  posts: Post[]
  page: number
  limit: number
  hasMore: boolean
}

export interface JWTClaims {
  sub: string
  email: string
  iat?: number
  exp?: number
}
