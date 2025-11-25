// Cloudflare Images API client
export class CloudflareImages {
  private accountID: string
  private apiToken: string
  private variant: string

  constructor(accountID: string, apiToken: string, variant: string = 'public') {
    this.accountID = accountID
    this.apiToken = apiToken
    this.variant = variant
  }

  async uploadImage(
    file: File,
    metadata?: { id?: string; requireSignedURLs?: boolean },
  ): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    if (metadata?.id) {
      formData.append('id', metadata.id)
    }

    if (metadata?.requireSignedURLs !== undefined) {
      formData.append(
        'requireSignedURLs',
        metadata.requireSignedURLs.toString(),
      )
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/images/v1`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = (await response
        .json()
        .catch(() => ({ errors: [{ message: response.statusText }] }))) as {
        errors?: Array<{ message?: string }>
      }
      throw new Error(
        `Failed to upload image: ${
          error.errors?.[0]?.message || response.statusText
        }`,
      )
    }

    const data = (await response.json()) as {
      result?: {
        variants?: string[]
        id?: string
        filename?: string
      }
    }

    // Return the image URL
    // Cloudflare Images provides variants, we'll use the first variant
    if (data.result?.variants && data.result.variants.length > 0) {
      return data.result.variants[0]
    }

    // Fallback: construct URL from image ID
    // Format: https://imagedelivery.net/<account-hash>/<image-id>/<variant-name>
    // Note: Account hash is different from account ID
    // You need to get the account hash from Cloudflare Images dashboard or API
    // For now, we'll use account ID as a placeholder - you may need to adjust this
    if (data.result?.id) {
      // The account hash should be retrieved separately or configured as an env variable
      // Using account ID as fallback (may not work - you need the actual account hash)
      return `https://imagedelivery.net/${this.accountID}/${data.result.id}/${this.variant}`
    }

    throw new Error('Failed to get image URL from response')
  }

  async deleteImage(imageID: string): Promise<void> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/images/v1/${imageID}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    })

    if (!response.ok) {
      const error = (await response
        .json()
        .catch(() => ({ errors: [{ message: response.statusText }] }))) as {
        errors?: Array<{ message?: string }>
      }
      throw new Error(
        `Failed to delete image: ${
          error.errors?.[0]?.message || response.statusText
        }`,
      )
    }
  }

  async getImage(imageID: string): Promise<any> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/images/v1/${imageID}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const error = (await response
        .json()
        .catch(() => ({ errors: [{ message: response.statusText }] }))) as {
        errors?: Array<{ message?: string }>
      }
      throw new Error(
        `Failed to get image: ${
          error.errors?.[0]?.message || response.statusText
        }`,
      )
    }

    return response.json()
  }
}
