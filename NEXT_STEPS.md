# ✅ Setup Progress

## Completed Steps

1. ✅ **Dependencies Installed** - All packages installed via `pnpm install`
2. ✅ **JWT Secret Generated** - Secure secret generated and added to backend `.env`
3. ✅ **Environment Files Created** - Template files ready at:
   - `apps/web/.env.local`
   - `apps/api/.env`
4. ✅ **TypeScript Configuration Fixed** - Path aliases configured correctly
5. ✅ **Build Verification** - Frontend builds successfully
6. ✅ **Code Quality** - All TypeScript errors resolved

## 🔧 Required Configuration (Before Running)

You need to configure these services before the app will work:

### 1. Firebase Setup ⚠️ REQUIRED
**Status:** Not configured yet

**Steps:**
1. Go to https://console.firebase.google.com/
2. Create a new project (or use existing)
3. Enable **Firestore Database**:
   - Navigate to Firestore Database
   - Click "Create database"
   - Start in test mode (for development)
   - Select a location
4. Get Service Account:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Copy entire JSON content
   - Paste into `FIREBASE_SERVICE_ACCOUNT` in `apps/api/.env` (as a JSON string)

**Update:** `apps/api/.env`
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### 2. Google OAuth Setup ⚠️ REQUIRED
**Status:** Not configured yet

**Steps:**
1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable APIs:
   - Go to "APIs & Services" → "Library"
   - Enable "Google+ API" (or use Identity API)
4. Create OAuth Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000`
   - Copy Client ID and Client Secret

**Update both files:**
- `apps/web/.env.local`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id`
- `apps/api/.env`: 
  - `GOOGLE_CLIENT_ID=your-client-id`
  - `GOOGLE_CLIENT_SECRET=your-client-secret`

### 3. Admin Email Configuration ⚠️ REQUIRED
**Status:** Not configured yet

**Update:** `apps/api/.env`
```env
ADMIN_EMAILS=your-email@gmail.com,another-admin@example.com
```
Add all email addresses that should have admin access (comma-separated).

## 🚀 Ready to Run

Once the above configurations are complete, you can start the servers:

**Terminal 1 - Backend:**
```bash
pnpm dev:api
```

**Terminal 2 - Frontend:**
```bash
pnpm dev
```

Then visit:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

## 📝 Quick Test Checklist

After configuration and starting servers:

- [ ] Frontend loads at http://localhost:3000
- [ ] Backend API responds at http://localhost:3001
- [ ] Can click "Admin" and see login page
- [ ] Google login works (after OAuth setup)
- [ ] Can access admin dashboard after login
- [ ] Can create a blog post
- [ ] Can save as draft
- [ ] Can publish a post
- [ ] Published posts appear on home page

## 🐛 Troubleshooting

### "Cannot connect to API"
- Check backend is running on port 3001
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### "Firebase connection error"
- Verify `FIREBASE_SERVICE_ACCOUNT` JSON is correctly formatted
- Check Firestore is enabled in Firebase console
- Ensure service account has proper permissions

### "Google OAuth not working"
- Verify Client ID matches in both frontend and backend
- Check authorized origins include `http://localhost:3000`
- Ensure Google+ API is enabled

### "Unauthorized" when logging in
- Check your email is in `ADMIN_EMAILS` list
- Verify JWT_SECRET is set
- Check browser console for errors

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)

---

**Current Status:** ✅ Code is ready, awaiting Firebase and Google OAuth configuration
