import { CloudflareImages } from '../utils/cloudflare-images';
import { authMiddleware, createUnauthorizedResponse } from '../middleware/auth';
import { Config } from '../utils/config';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export async function handleUploadImage(
  request: Request,
  config: Config
): Promise<Response> {
  // Check authentication
  const auth = await authMiddleware(request, config);
  if (!auth) {
    return createUnauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No image file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 5MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid file type. Allowed types: jpeg, jpg, png, gif, webp' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Cloudflare Images client
    const cloudflareImages = new CloudflareImages(
      config.cloudflareAccountID,
      config.cloudflareImagesAPIToken,
      config.cloudflareImagesVariant
    );

    // Upload to Cloudflare Images
    const imageURL = await cloudflareImages.uploadImage(file, {
      requireSignedURLs: false, // Set to true if you want signed URLs
    });

    return new Response(
      JSON.stringify({ url: imageURL }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to upload image' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

