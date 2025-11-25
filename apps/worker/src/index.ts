import { Env } from './types';
import { Config } from './utils/config';
import { Firebase } from './utils/firebase';
import { MongoDB } from './utils/mongodb';
import { handleCORS, addCORSHeaders } from './middleware/cors';
import { handleHealth } from './handlers/health';
import {
  handleGoogleLogin,
  handleRefreshToken,
  handleGetMe,
  handleLogout,
} from './handlers/auth';
import {
  handleGetPosts,
  handleSearchPosts,
  handleGetPost,
  handleGetPostAdmin,
  handleCreatePost,
  handleUpdatePost,
  handleDeletePost,
} from './handlers/posts';
import { handleGetAbout, handleUpdateAbout } from './handlers/about';
import { handleUploadImage } from './handlers/uploads';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Initialize config
    const config = new Config(env);

    // Handle CORS preflight
    const corsResponse = handleCORS(request, config);
    if (corsResponse) {
      return corsResponse;
    }

    // Initialize services
    const firebase = new Firebase(
      config.firebaseProjectID,
      config.firebaseServiceAccount
    );
    const mongoDB = new MongoDB(config.mongodbURI);

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    let response: Response;

    try {
      // Health check
      if (path === '/health' && method === 'GET') {
        response = await handleHealth();
      }
      // Auth routes
      else if (path === '/auth/google' && method === 'POST') {
        response = await handleGoogleLogin(request, config, firebase);
      } else if (path === '/auth/refresh' && method === 'POST') {
        response = await handleRefreshToken(request, config, firebase);
      } else if (path === '/auth/me' && method === 'GET') {
        response = await handleGetMe(request, config, firebase);
      } else if (path === '/auth/logout' && method === 'POST') {
        response = await handleLogout(request, config, firebase);
      }
      // Posts routes
      else if (path === '/posts' && method === 'GET') {
        response = await handleGetPosts(request, config, mongoDB);
      } else if (path === '/posts/search' && method === 'GET') {
        response = await handleSearchPosts(request, config, mongoDB);
      } else if (path.startsWith('/posts/admin/') && method === 'GET') {
        response = await handleGetPostAdmin(request, config, mongoDB);
      } else if (path.startsWith('/posts/') && method === 'GET') {
        response = await handleGetPost(request, config, mongoDB);
      } else if (path === '/posts' && method === 'POST') {
        response = await handleCreatePost(request, config, mongoDB);
      } else if (path.startsWith('/posts/') && method === 'PUT') {
        response = await handleUpdatePost(request, config, mongoDB);
      } else if (path.startsWith('/posts/') && method === 'DELETE') {
        response = await handleDeletePost(request, config, mongoDB);
      }
      // About routes
      else if (path === '/about' && method === 'GET') {
        response = await handleGetAbout(request, config, mongoDB);
      } else if (path === '/about' && method === 'PUT') {
        response = await handleUpdateAbout(request, config, mongoDB);
      }
      // Upload routes
      else if (path === '/uploads/image' && method === 'POST') {
        response = await handleUploadImage(request, config);
      }
      // 404
      else {
        response = new Response(
          JSON.stringify({ error: 'Not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error('Request error:', error);
      response = new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add CORS headers to response
    return addCORSHeaders(response, config);
  },
};

