# Quick Start Guide

## ✅ Completed Steps

1. **Dependencies Installed** - All packages have been installed via `pnpm install`
2. **JWT Secret Generated** - A secure JWT secret has been generated and added to `apps/api/.env`
3. **Environment Files Created** - Template environment files are ready for configuration

## 🔧 Configuration Required

Before running the application, you need to configure:

### 1. Firebase Setup (Required)
- [ ] Create a Firebase project at https://console.firebase.google.com/
- [ ] Enable Firestore Database
- [ ] Generate a service account key (Project Settings → Service Accounts)
- [ ] Copy the service account JSON to `FIREBASE_SERVICE_ACCOUNT` in `apps/api/.env`

### 2. Google OAuth Setup (Required for Admin)
- [ ] Go to https://console.cloud.google.com/
- [ ] Create OAuth 2.0 credentials
- [ ] Add `http://localhost:3000` to authorized origins
- [ ] Copy Client ID and Secret to both `.env` files

### 3. Update Environment Variables

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-google-client-id
```

**Backend** (`apps/api/.env`):
```env
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
ADMIN_EMAILS=your-email@gmail.com
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

## 🚀 Running the Application

Once configured, run in two separate terminals:

**Terminal 1 - Backend:**
```bash
pnpm dev:api
```

**Terminal 2 - Frontend:**
```bash
pnpm dev
```

Then visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📝 Next Steps After Setup

1. Log in as admin using Google SSO
2. Create your first blog post
3. Edit the About section
4. Customize as needed

For detailed setup instructions, see [SETUP.md](./SETUP.md)
