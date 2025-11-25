import { MongoDB } from '../utils/mongodb';
import { authMiddleware, createUnauthorizedResponse } from '../middleware/auth';
import { Config } from '../utils/config';
import { Post, CreatePostRequest, UpdatePostRequest, PostsResponse } from '../types';

export async function handleGetPosts(
  request: Request,
  config: Config,
  mongoDB: MongoDB
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const includeDrafts = url.searchParams.get('includeDrafts') === 'true';

    const validPage = page < 1 ? 1 : page;
    const validLimit = limit < 1 || limit > 100 ? 10 : limit;
    const skip = (validPage - 1) * validLimit;

    const filter: any = {};
    if (!includeDrafts) {
      filter.published = true;
    }

    const posts = await mongoDB.findPosts(filter, {
      sort: { createdAt: -1 },
      skip,
      limit: validLimit + 1, // Fetch one extra to check if there are more
    });

    const hasMore = posts.length > validLimit;
    const resultPosts = hasMore ? posts.slice(0, validLimit) : posts;

    const response: PostsResponse = {
      posts: resultPosts,
      page: validPage,
      limit: validLimit,
      hasMore,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch posts' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleSearchPosts(
  request: Request,
  config: Config,
  mongoDB: MongoDB
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validLimit = limit < 1 || limit > 100 ? 10 : limit;

    const filter = {
      published: true,
      title: { $regex: query, $options: 'i' }, // case-insensitive
    };

    const posts = await mongoDB.findPosts(filter, {
      sort: { createdAt: -1 },
      limit: validLimit,
    });

    return new Response(JSON.stringify(posts || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search posts error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search posts' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleGetPost(
  request: Request,
  config: Config,
  mongoDB: MongoDB
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Invalid post ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const post = await mongoDB.findOnePost({ _id: id, published: true });

    if (!post) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(post), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get post error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleGetPostAdmin(
  request: Request,
  config: Config,
  mongoDB: MongoDB
): Promise<Response> {
  const auth = await authMiddleware(request, config);
  if (!auth) {
    return createUnauthorizedResponse();
  }

  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Invalid post ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const post = await mongoDB.findOnePost({ _id: id });

    if (!post) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(post), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get post admin error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleCreatePost(
  request: Request,
  config: Config,
  mongoDB: MongoDB
): Promise<Response> {
  const auth = await authMiddleware(request, config);
  if (!auth) {
    return createUnauthorizedResponse();
  }

  try {
    const body: CreatePostRequest = await request.json();
    const { title, content, summary, imageUrl, published } = body;

    if (!title || !content || !summary) {
      return new Response(
        JSON.stringify({ error: 'Title, content, and summary are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();
    const post: Omit<Post, 'id'> = {
      title,
      content,
      summary,
      imageUrl: imageUrl || '',
      published: published || false,
      authorId: auth.userID,
      createdAt: now,
      updatedAt: now,
    };

    const createdPost = await mongoDB.insertPost(post);

    return new Response(JSON.stringify(createdPost), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create post error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleUpdatePost(
  request: Request,
  config: Config,
  mongoDB: MongoDB
): Promise<Response> {
  const auth = await authMiddleware(request, config);
  if (!auth) {
    return createUnauthorizedResponse();
  }

  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Invalid post ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if post exists and user is the author
    const existingPost = await mongoDB.findOnePost({ _id: id });
    if (!existingPost) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (existingPost.authorId !== auth.userID) {
      return new Response(
        JSON.stringify({ error: 'You can only update your own posts' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: UpdatePostRequest = await request.json();
    const update: any = {
      updatedAt: new Date().toISOString(),
    };

    if (body.title !== undefined) update.title = body.title;
    if (body.content !== undefined) update.content = body.content;
    if (body.summary !== undefined) update.summary = body.summary;
    if (body.imageUrl !== undefined) update.imageUrl = body.imageUrl;
    if (body.published !== undefined) update.published = body.published;

    const updatedPost = await mongoDB.updatePost({ _id: id }, { $set: update });

    if (!updatedPost) {
      return new Response(
        JSON.stringify({ error: 'Failed to update post' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(updatedPost), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update post error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleDeletePost(
  request: Request,
  config: Config,
  mongoDB: MongoDB
): Promise<Response> {
  const auth = await authMiddleware(request, config);
  if (!auth) {
    return createUnauthorizedResponse();
  }

  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Invalid post ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if post exists and user is the author
    const existingPost = await mongoDB.findOnePost({ _id: id });
    if (!existingPost) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (existingPost.authorId !== auth.userID) {
      return new Response(
        JSON.stringify({ error: 'You can only delete your own posts' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const deleted = await mongoDB.deletePost({ _id: id });

    if (!deleted) {
      return new Response(
        JSON.stringify({ error: 'Failed to delete post' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Post deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Delete post error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

