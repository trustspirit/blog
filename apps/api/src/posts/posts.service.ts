import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PostsService {
  constructor(private firebaseService: FirebaseService) {}

  async findAll(page: number = 1, limit: number = 10, includeDrafts: boolean = false) {
    const db = this.firebaseService.getFirestore();
    const postsRef = db.collection('posts');
    
    // Get all posts and filter in memory to avoid Firestore index requirements
    const snapshot = await postsRef.orderBy('createdAt', 'desc').get();
    let allPosts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BlogPost[];

    // Filter drafts if needed
    if (!includeDrafts) {
      allPosts = allPosts.filter((post) => post.published === true);
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const posts = allPosts.slice(startIndex, startIndex + limit);
    const hasMore = allPosts.length > startIndex + limit;

    return {
      posts,
      page,
      limit,
      hasMore,
    };
  }

  async findOne(id: string) {
    const db = this.firebaseService.getFirestore();
    const postDoc = await db.collection('posts').doc(id).get();

    if (!postDoc.exists) {
      throw new NotFoundException('Post not found');
    }

    const data = postDoc.data();
    if (!data.published) {
      throw new NotFoundException('Post not found');
    }

    return {
      id: postDoc.id,
      ...data,
    };
  }

  async findOneForAdmin(id: string) {
    const db = this.firebaseService.getFirestore();
    const postDoc = await db.collection('posts').doc(id).get();

    if (!postDoc.exists) {
      throw new NotFoundException('Post not found');
    }

    return {
      id: postDoc.id,
      ...postDoc.data(),
    };
  }

  async create(postData: Partial<BlogPost>, userId: string) {
    const db = this.firebaseService.getFirestore();
    const now = new Date();
    
    const newPost = {
      title: postData.title,
      content: postData.content,
      summary: postData.summary,
      imageUrl: postData.imageUrl || '',
      published: postData.published || false,
      createdAt: now,
      updatedAt: now,
      authorId: userId,
    };

    const docRef = await db.collection('posts').add(newPost);
    return {
      id: docRef.id,
      ...newPost,
    };
  }

  async update(id: string, postData: Partial<BlogPost>, userId: string) {
    const db = this.firebaseService.getFirestore();
    const postDoc = await db.collection('posts').doc(id).get();

    if (!postDoc.exists) {
      throw new NotFoundException('Post not found');
    }

    const existingPost = postDoc.data();
    if (existingPost.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (postData.title !== undefined) updateData.title = postData.title;
    if (postData.content !== undefined) updateData.content = postData.content;
    if (postData.summary !== undefined) updateData.summary = postData.summary;
    if (postData.imageUrl !== undefined) updateData.imageUrl = postData.imageUrl;
    if (postData.published !== undefined) updateData.published = postData.published;

    await db.collection('posts').doc(id).update(updateData);

    const updatedDoc = await db.collection('posts').doc(id).get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  }

  async delete(id: string, userId: string) {
    const db = this.firebaseService.getFirestore();
    const postDoc = await db.collection('posts').doc(id).get();

    if (!postDoc.exists) {
      throw new NotFoundException('Post not found');
    }

    const existingPost = postDoc.data();
    if (existingPost.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await db.collection('posts').doc(id).delete();
    return { message: 'Post deleted successfully' };
  }
}
