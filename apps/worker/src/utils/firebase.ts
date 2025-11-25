import { User } from '../types'

// Firebase Admin SDK for Cloudflare Workers
// Note: We'll use Firebase REST API or Firebase Admin SDK compatible approach

export class Firebase {
  private projectID: string
  private serviceAccount: any
  private accessToken?: string

  constructor(projectID: string, serviceAccountJSON: string) {
    this.projectID = projectID

    if (serviceAccountJSON) {
      try {
        this.serviceAccount = JSON.parse(serviceAccountJSON)
      } catch (error) {
        throw new Error('Invalid Firebase service account JSON')
      }
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken
    }

    // Generate access token from service account
    // This is a simplified version - you may need to use a JWT library
    // to create a proper JWT for Google OAuth2
    throw new Error(
      'Access token generation not implemented. Use Firebase REST API with proper authentication.',
    )
  }

  async getUser(userID: string): Promise<Record<string, any> | null> {
    const token = await this.getAccessToken()
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectID}/databases/(default)/documents/users/${userID}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to get user: ${response.statusText}`)
    }

    const data = await response.json()
    return this.convertFirestoreDocument(data)
  }

  async createOrUpdateUser(
    userID: string,
    data: Record<string, any>,
  ): Promise<void> {
    const token = await this.getAccessToken()
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectID}/databases/(default)/documents/users/${userID}`

    const firestoreData = this.convertToFirestoreFormat(data)

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: firestoreData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create/update user: ${response.statusText}`)
    }
  }

  async saveRefreshToken(userID: string, token: string): Promise<void> {
    const tokenAuth = await this.getAccessToken()
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectID}/databases/(default)/documents/refreshTokens/${userID}`

    const data = {
      token: { stringValue: token },
      userId: { stringValue: userID },
      createdAt: { timestampValue: new Date().toISOString() },
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: data,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to save refresh token: ${response.statusText}`)
    }
  }

  async getRefreshToken(userID: string): Promise<string | null> {
    const token = await this.getAccessToken()
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectID}/databases/(default)/documents/refreshTokens/${userID}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to get refresh token: ${response.statusText}`)
    }

    const data = (await response.json()) as {
      fields?: { token?: { stringValue?: string } }
    }
    const fields = data.fields || {}
    return fields.token?.stringValue || null
  }

  async deleteRefreshToken(userID: string): Promise<void> {
    const token = await this.getAccessToken()
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectID}/databases/(default)/documents/refreshTokens/${userID}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete refresh token: ${response.statusText}`)
    }
  }

  // Image upload is now handled by Cloudflare Images
  // This method is kept for backward compatibility but should not be used
  // Use CloudflareImages.uploadImage() instead

  private convertFirestoreDocument(doc: any): Record<string, any> {
    const fields = doc.fields || {}
    const result: Record<string, any> = {}

    for (const [key, value] of Object.entries(fields)) {
      result[key] = this.convertFirestoreValue(value as any)
    }

    return result
  }

  private convertFirestoreValue(value: any): any {
    if (value.stringValue !== undefined) return value.stringValue
    if (value.integerValue !== undefined) return parseInt(value.integerValue)
    if (value.doubleValue !== undefined) return parseFloat(value.doubleValue)
    if (value.booleanValue !== undefined) return value.booleanValue
    if (value.timestampValue !== undefined) return value.timestampValue
    if (value.nullValue !== undefined) return null
    return value
  }

  private convertToFirestoreFormat(
    data: Record<string, any>,
  ): Record<string, any> {
    const result: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        result[key] = { stringValue: value }
      } else if (typeof value === 'number') {
        result[key] = { doubleValue: value.toString() }
      } else if (typeof value === 'boolean') {
        result[key] = { booleanValue: value }
      } else if (value instanceof Date) {
        result[key] = { timestampValue: value.toISOString() }
      } else {
        result[key] = { stringValue: String(value) }
      }
    }

    return result
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.')
    return lastDot > 0 ? filename.substring(lastDot) : ''
  }
}
