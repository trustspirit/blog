# Setup Guide

This guide will help you set up the blog website step by step.

## Step 1: Dependencies Installed ✅

Dependencies have been installed. You can verify by running:
```bash
pnpm install
```

## Step 2: Configure Environment Variables

### Frontend Configuration

Edit `apps/web/.env.local` and update:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID

### Backend Configuration

Edit `apps/api/.env` and update:
- `PORT`: Backend port (default: 3001)
- `FRONTEND_URL`: Frontend URL (default: http://localhost:3000)
- `JWT_SECRET`: A random secret key for JWT tokens (generate a strong random string)
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
- `ADMIN_EMAILS`: Comma-separated list of admin emails (e.g., "admin@example.com,another@example.com")
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_SERVICE_ACCOUNT`: JSON string of your Firebase service account

## Step 3: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Firestore Database**:
   - Go to Firestore Database in the left menu
   - Click "Create database"
   - Start in test mode (or production mode with proper security rules)
   - Choose a location
4. Generate Service Account:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Copy the entire JSON content and paste it into `FIREBASE_SERVICE_ACCOUNT` in `apps/api/.env` (as a JSON string)

## Step 4: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for development)
   - Add authorized redirect URIs:
     - `http://localhost:3000` (for development)
   - Copy the Client ID and Client Secret
   - Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in both frontend and backend `.env` files

## Step 5: Generate JWT Secret

Generate a secure random string for JWT_SECRET. You can use:
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Update `JWT_SECRET` in `apps/api/.env` with the generated value.

## Step 6: Run the Application

### Start Backend (Terminal 1)
```bash
pnpm dev:api
```

### Start Frontend (Terminal 2)
```bash
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Step 7: First Login

1. Navigate to http://localhost:3000
2. Click "Admin" in the navigation
3. Sign in with Google using an email listed in `ADMIN_EMAILS`
4. You'll be redirected to the admin dashboard

## Troubleshooting

### Firebase Connection Issues
- Verify your `FIREBASE_SERVICE_ACCOUNT` JSON is correctly formatted
- Ensure Firestore is enabled in your Firebase project
- Check that the service account has proper permissions

### Google OAuth Issues
- Verify the Client ID and Secret are correct
- Ensure authorized origins and redirect URIs are set correctly
- Check that Google+ API is enabled

### CORS Issues
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running

### Authentication Issues
- Verify your email is in the `ADMIN_EMAILS` list
- Check that JWT_SECRET is set correctly
- Ensure tokens are being stored in localStorage

## Next Steps

Once everything is set up:
1. Create your first blog post from the admin dashboard
2. Edit the About section with your information
3. Customize the styling if needed
4. Deploy to production (update environment variables for production URLs)
