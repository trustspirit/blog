import { MongoDB } from '../utils/mongodb';
import { authMiddleware, createUnauthorizedResponse } from '../middleware/auth';
import { Config } from '../utils/config';
import { About } from '../types';

export async function handleGetAbout(
  request: Request,
  config: Config,
  mongoDB: MongoDB
): Promise<Response> {
  try {
    const about = await mongoDB.findAbout({ slug: 'main' });

    if (!about) {
      return new Response(
        JSON.stringify({ error: 'About page not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(about), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get about error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch about page' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleUpdateAbout(
  request: Request,
  config: Config,
  mongoDB: MongoDB
): Promise<Response> {
  const auth = await authMiddleware(request, config);
  if (!auth) {
    return createUnauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();
    const about: Omit<About, 'id'> = {
      slug: 'main',
      content,
      updatedAt: now,
    };

    const updatedAbout = await mongoDB.upsertAbout(about);

    return new Response(JSON.stringify(updatedAbout), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update about error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update about page' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

