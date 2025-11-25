import { Env } from '../types'

export class Config {
  private env: Env

  constructor(env: Env) {
    this.env = env
  }

  get jwtSecret(): string {
    return this.env.JWT_SECRET || 'your-super-secret-jwt-key'
  }

  get googleClientID(): string {
    return this.env.GOOGLE_CLIENT_ID || ''
  }

  get adminEmails(): string[] {
    const emails = this.env.ADMIN_EMAILS || ''
    return emails
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0)
  }

  get firebaseProjectID(): string {
    return this.env.FIREBASE_PROJECT_ID || ''
  }

  get firebaseServiceAccount(): string {
    return this.env.FIREBASE_SERVICE_ACCOUNT || ''
  }

  get cloudflareAccountID(): string {
    return this.env.CLOUDFLARE_ACCOUNT_ID || ''
  }

  get cloudflareImagesAPIToken(): string {
    return this.env.CLOUDFLARE_IMAGES_API_TOKEN || ''
  }

  get cloudflareImagesVariant(): string {
    return this.env.CLOUDFLARE_IMAGES_VARIANT || 'public'
  }

  get mongodbURI(): string {
    return (
      this.env.MONGODB_URI ||
      'mongodb://admin:password@localhost:27017/blog?authSource=admin'
    )
  }

  get frontendURL(): string {
    return this.env.FRONTEND_URL || 'http://localhost:3000'
  }

  isAdminEmail(email: string): boolean {
    return this.adminEmails.includes(email)
  }
}
