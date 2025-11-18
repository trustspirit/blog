# Blog API (Go)

A RESTful API server built with Go and Gin framework for the blog application.

## Tech Stack

- **Framework**: Gin Web Framework
- **Language**: Go 1.21+
- **Databases**:
  - MongoDB (posts, about content)
  - Firestore (users, refresh tokens)
- **Storage**: Firebase Cloud Storage (images)
- **Authentication**: JWT with Google OAuth

## Project Structure

```
apps/api/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point
├── internal/
│   ├── config/                  # Configuration management
│   ├── database/                # MongoDB connection
│   ├── firebase/                # Firebase integration
│   ├── handlers/                # HTTP handlers
│   │   ├── auth.go             # Authentication endpoints
│   │   ├── posts.go            # Posts CRUD
│   │   ├── about.go            # About page
│   │   ├── uploads.go          # Image uploads
│   │   └── health.go           # Health check
│   ├── middleware/              # HTTP middleware
│   │   └── auth.go             # JWT authentication
│   └── models/                  # Data models
│       ├── post.go
│       ├── about.go
│       └── user.go
├── pkg/
│   └── utils/
│       └── jwt.go              # JWT utilities
├── Dockerfile
├── .env.example
└── README.md
```

## Prerequisites

- Go 1.21 or higher
- MongoDB instance
- Firebase project with:
  - Firestore enabled
  - Cloud Storage bucket
  - Service account credentials
- Google OAuth client credentials

## Installation

1. Clone the repository and navigate to the API directory:
```bash
cd apps/api
```

2. Install dependencies:
```bash
go mod download
```

3. Copy the example environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=3010
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
ADMIN_EMAILS=admin@example.com
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-project-id.appspot.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
MONGODB_URI=mongodb://admin:password@localhost:27017/blog?authSource=admin
```

## Running Locally

### Development Mode

```bash
go run cmd/api/main.go
```

### Build and Run

```bash
# Build
go build -o main cmd/api/main.go

# Run
./main
```

The server will start on `http://localhost:3010` (or the port specified in your `.env` file).

## API Endpoints

### Health Check
- `GET /health` - Service health check

### Authentication
- `POST /auth/google` - Login with Google OAuth token
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user (requires auth)
- `POST /auth/logout` - Logout user (requires auth)

### Posts
- `GET /posts` - List posts (supports pagination, filtering)
  - Query params: `page`, `limit`, `includeDrafts`
- `GET /posts/:id` - Get published post by ID
- `GET /posts/admin/:id` - Get any post by ID (requires auth)
- `POST /posts` - Create new post (requires auth)
- `PUT /posts/:id` - Update post (requires auth, author only)
- `DELETE /posts/:id` - Delete post (requires auth, author only)

### About
- `GET /about` - Get about page content
- `PUT /about` - Update about page (requires auth)

### Uploads
- `POST /uploads/image` - Upload image to Firebase Storage (requires auth)
  - Max size: 5MB
  - Allowed types: jpeg, jpg, png, gif, webp

## Docker

### Build Docker Image

```bash
docker build -t blog-api .
```

### Run with Docker

```bash
docker run -p 3010:3010 \
  -e PORT=3010 \
  -e MONGODB_URI=your-mongodb-uri \
  -e JWT_SECRET=your-jwt-secret \
  -e GOOGLE_CLIENT_ID=your-client-id \
  -e ADMIN_EMAILS=admin@example.com \
  -e FIREBASE_PROJECT_ID=your-project-id \
  -e FIREBASE_STORAGE_BUCKET=your-bucket \
  -e FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}' \
  blog-api
```

## Deployment

### Google Cloud Run

Use the deployment scripts in the root directory:

```bash
# Full deployment with all checks
../deploy-api.sh

# Quick deployment
../deploy-api-quick.sh
```

Or deploy manually:

```bash
# Build and push
docker build -t gcr.io/YOUR_PROJECT_ID/blog-api .
docker push gcr.io/YOUR_PROJECT_ID/blog-api

# Deploy to Cloud Run
gcloud run deploy blog-api \
  --image gcr.io/YOUR_PROJECT_ID/blog-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3010
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3010 |
| `FRONTEND_URL` | Frontend URL for CORS | No | http://localhost:3000 |
| `JWT_SECRET` | Secret key for JWT signing | Yes | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No | - |
| `ADMIN_EMAILS` | Comma-separated admin emails | Yes | - |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes | - |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket name | Yes | - |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON | Yes (prod) | - |
| `MONGODB_URI` | MongoDB connection string | Yes | - |

## Authentication Flow

1. Frontend sends Google ID token to `/auth/google`
2. Backend validates token with Google
3. Checks if user email is in admin whitelist
4. Creates/updates user in Firestore
5. Generates JWT tokens (15min access, 7day refresh)
6. Returns tokens and user info

## Development

### Install Development Tools

```bash
# Install goimports (Go imports formatter)
go install golang.org/x/tools/cmd/goimports@latest

# Install golangci-lint (linter)
brew install golangci-lint
# or
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Install air (optional - for hot reload)
go install github.com/cosmtrek/air@latest
```

### Using Makefile

The project includes a Makefile for common tasks:

```bash
# Show all available commands
make help

# Format code (gofmt + goimports)
make fmt

# Run linter
make lint

# Run linter with auto-fix
make lint-fix

# Run tests
make test

# Run tests with coverage
make test-coverage

# Build the application
make build

# Run the application
make run

# Run all checks (format, lint, test)
make check

# Development mode with hot reload (requires air)
make dev

# Docker operations
make docker-build
make docker-run

# Clean build artifacts
make clean
```

### Code Formatting

```bash
# Using Make
make fmt

# Or manually
gofmt -s -w .
goimports -w .
```

### Linting

```bash
# Using Make
make lint

# Or manually
golangci-lint run

# With auto-fix
golangci-lint run --fix
```

### Running Tests

```bash
# Using Make
make test

# With coverage
make test-coverage

# Or manually
go test -v ./...
```

### VSCode Integration

The project includes VSCode settings that will:
- Auto-format on save using `goimports`
- Run linter using `golangci-lint`
- Organize imports automatically
- Show inlay hints for better code understanding

Install the recommended extension:
- [Go for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=golang.go)

## Migration from NestJS

This Go API is a complete replacement of the previous NestJS API with:

- **Better Performance**: Go's superior concurrency and lower memory footprint
- **Simpler Deployment**: Single binary, no runtime dependencies
- **Type Safety**: Compile-time type checking
- **Same Functionality**: All endpoints and features maintained

### API Compatibility

All endpoints remain the same, ensuring frontend compatibility. Only the implementation language changed.

## License

MIT
