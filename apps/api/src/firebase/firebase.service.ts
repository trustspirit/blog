import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db: admin.firestore.Firestore;

  onModuleInit() {
    if (!admin.apps.length) {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : null;

      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        // For local development, you can use Firebase emulator
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'blog-project',
        });
      }
    }

    this.db = admin.firestore();
  }

  getFirestore(): admin.firestore.Firestore {
    return this.db;
  }
}
