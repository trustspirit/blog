import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AboutService {
  constructor(private firebaseService: FirebaseService) {}

  async getAbout() {
    const db = this.firebaseService.getFirestore();
    const aboutDoc = await db.collection('about').doc('main').get();

    if (!aboutDoc.exists) {
      return {
        id: 'main',
        content: '<p>No information available.</p>',
        updatedAt: new Date(),
      };
    }

    return {
      id: aboutDoc.id,
      ...aboutDoc.data(),
    };
  }

  async updateAbout(content: string) {
    const db = this.firebaseService.getFirestore();
    const now = new Date();

    await db.collection('about').doc('main').set({
      content,
      updatedAt: now,
    }, { merge: true });

    return {
      id: 'main',
      content,
      updatedAt: now,
    };
  }
}
