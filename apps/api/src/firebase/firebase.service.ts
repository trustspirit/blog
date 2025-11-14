import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private storage: admin.storage.Storage;
  private bucket: ReturnType<admin.storage.Storage['bucket']>;

  onModuleInit() {
    if (!admin.apps.length) {
      let serviceAccount = null;
      
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (error) {
          console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error);
          throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON format');
        }
      }

      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
        });
      } else {
        // For local development, you can use Firebase emulator
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'blog-project',
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
        });
      }
    }

    this.storage = admin.storage();
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    
    if (!bucketName) {
      console.warn('FIREBASE_STORAGE_BUCKET not set. Image uploads may not work.');
    }
    
    this.bucket = this.storage.bucket(bucketName);
  }

  getStorage(): admin.storage.Storage {
    return this.storage;
  }

  getBucket(): ReturnType<admin.storage.Storage['bucket']> {
    return this.bucket;
  }

  async uploadImage(file: Express.Multer.File, path: string): Promise<string> {
    if (!file || !file.buffer) {
      throw new Error('Invalid file provided');
    }

    if (!path || path.trim().length === 0) {
      throw new Error('Invalid file path provided');
    }

    if (!this.bucket) {
      throw new Error('Firebase Storage bucket not initialized');
    }

    const fileUpload = this.bucket.file(path);
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });

      stream.on('finish', async () => {
        try {
          // Make the file publicly accessible
          await fileUpload.makePublic();
          const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${path}`;
          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });

      stream.end(file.buffer);
    });
  }

  async deleteImage(path: string): Promise<void> {
    const file = this.bucket.file(path);
    await file.delete();
  }
}
