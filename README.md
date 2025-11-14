# Personal Blog Website

A modern personal blog website built with Next.js, NestJS, and Firebase.

## Tech Stack

- **Frontend**: Next.js, TanStack Query, SCSS Modules, Jotai
- **Backend**: NestJS, Firebase Database
- **Authentication**: Google SSO with JWT and refresh tokens
- **Package Manager**: pnpm (monorepo)

## Features

- **Main Page**: Single-page layout with horizontal carousel showing 10 most recent posts
- **Blog Posts List**: Infinite scroll with lazy loading
- **Admin Dashboard**: Create, edit, and manage blog posts
- **Draft System**: Save posts as drafts (only visible to admin)
- **Rich Text Editor**: Full-featured editor for blog content
- **About Section**: Editable about page
- **Google SSO**: Secure admin authentication

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Firebase project with Firestore enabled
- Google OAuth 2.0 credentials

### Installation

1. Clone the repository and install dependencies:
```bash
pnpm install
```

2. Set up environment variables:

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

**Backend** (`apps/api/.env`):
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ADMIN_EMAILS=admin@example.com
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

3. Configure Firebase:
   - Create a Firebase project
   - Enable Firestore Database
   - Generate a service account key
   - Add the service account JSON to `FIREBASE_SERVICE_ACCOUNT` env variable

4. Configure Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs
   - Copy Client ID and Client Secret

### Development

Run frontend (in one terminal):
```bash
pnpm dev
```

Run backend (in another terminal):
```bash
pnpm dev:api
```

The frontend will be available at `http://localhost:3000`
The backend API will be available at `http://localhost:3001`

### Build

```bash
pnpm build
```

## Project Structure

```
blog/
├── apps/
│   ├── web/          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/          # Next.js app router pages
│   │   │   ├── components/   # React components
│   │   │   ├── lib/          # API utilities
│   │   │   └── store/        # Jotai state management
│   │   └── public/           # Static assets
│   └── api/          # NestJS backend
│       └── src/
│           ├── auth/         # Authentication module
│           ├── posts/        # Blog posts module
│           ├── about/       # About section module
│           └── firebase/     # Firebase service
└── packages/         # Shared packages (if needed)
```

## Usage

1. **Viewing Posts**: Visit the home page to see the carousel of recent posts
2. **All Posts**: Click "View All Posts" to see the full list with infinite scroll
3. **Admin Login**: Click "Admin" in the navigation and sign in with Google
4. **Create Post**: In the admin dashboard, click "New Post"
5. **Edit Post**: Click "Edit" on any post in the dashboard
6. **Save Draft**: Use "Save as Draft" to save without publishing
7. **Publish**: Click "Publish" to make the post visible to everyone
8. **Edit About**: Click "Edit About" in the admin dashboard

## Notes

- Only emails listed in `ADMIN_EMAILS` can log in as admin
- Drafts are only visible in the admin dashboard
- The main page is designed to fit on a MacBook 14" screen without scrolling
- Images should be hosted externally or uploaded to a CDN
