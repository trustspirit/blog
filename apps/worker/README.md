# Blog API Worker

Cloudflare Workers를 사용한 블로그 API 서버입니다.

## 설정

### 환경 변수

다음 환경 변수들을 Cloudflare Workers에 설정해야 합니다:

```bash
# JWT 설정
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# 관리자 이메일 (쉼표로 구분)
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Firebase 설정 (Firestore 사용)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT=your-firebase-service-account-json

# Cloudflare Images 설정
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_IMAGES_API_TOKEN=your-cloudflare-images-api-token
CLOUDFLARE_IMAGES_VARIANT=public  # Optional: variant name (default: 'public')

# MongoDB 설정
MONGODB_URI=your-mongodb-connection-string

# 프론트엔드 URL
FRONTEND_URL=https://your-frontend-domain.com
```

### 환경 변수 설정 방법

Wrangler CLI를 사용하여 환경 변수를 설정할 수 있습니다:

```bash
# 각 환경 변수를 개별적으로 설정
wrangler secret put JWT_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put ADMIN_EMAILS
wrangler secret put FIREBASE_PROJECT_ID
wrangler secret put FIREBASE_SERVICE_ACCOUNT
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put CLOUDFLARE_IMAGES_API_TOKEN
wrangler secret put MONGODB_URI
wrangler secret put FRONTEND_URL
```

또는 `wrangler.toml` 파일에 직접 설정할 수도 있습니다 (보안에 주의):

```toml
[vars]
JWT_SECRET = "your-secret"
GOOGLE_CLIENT_ID = "your-client-id"
# ... 등등
```

## Cloudflare Images 설정

1. Cloudflare 대시보드에서 Images 서비스를 활성화합니다.
2. API 토큰을 생성합니다:
   - Cloudflare Dashboard > My Profile > API Tokens
   - "Create Token" 클릭
   - "Cloudflare Images:Edit" 권한 부여
3. Account ID를 확인합니다:
   - Cloudflare Dashboard 우측 사이드바에서 확인 가능
4. Variant를 설정합니다:
   - Cloudflare Dashboard > Images > Variants
   - 기본 variant 이름은 "public"입니다
   - 커스텀 variant를 만들 수도 있습니다 (예: "thumbnail", "large" 등)
   - `CLOUDFLARE_IMAGES_VARIANT` 환경 변수에 variant 이름을 설정하세요
5. 참고: Cloudflare Images API 응답에는 variants 배열이 포함되어 있으며, 첫 번째 variant URL이 자동으로 사용됩니다

## MongoDB 연결

Cloudflare Workers는 네이티브 MongoDB 드라이버를 지원하지 않으므로, 다음 중 하나의 방법을 사용해야 합니다:

1. **MongoDB Atlas Data API** 사용
2. **HTTP 프록시 서비스** 사용
3. **MongoDB Realm/Atlas App Services** 사용

현재 코드는 placeholder로 구현되어 있으므로, 실제 MongoDB 연결 방법에 맞게 `src/utils/mongodb.ts`를 수정해야 합니다.

## 개발

```bash
# 의존성 설치
pnpm install

# 로컬 개발 서버 실행
pnpm dev

# 타입 체크
pnpm type-check

# 배포
pnpm deploy
```

## API 엔드포인트

### Health Check
- `GET /health` - 서버 상태 확인

### 인증
- `POST /auth/google` - Google 로그인
- `POST /auth/refresh` - 토큰 갱신
- `GET /auth/me` - 현재 사용자 정보 (인증 필요)
- `POST /auth/logout` - 로그아웃 (인증 필요)

### 포스트
- `GET /posts` - 포스트 목록 조회
- `GET /posts/search?q=query` - 포스트 검색
- `GET /posts/:id` - 포스트 조회
- `GET /posts/admin/:id` - 포스트 조회 (초안 포함, 인증 필요)
- `POST /posts` - 포스트 생성 (인증 필요)
- `PUT /posts/:id` - 포스트 수정 (인증 필요)
- `DELETE /posts/:id` - 포스트 삭제 (인증 필요)

### About
- `GET /about` - About 페이지 조회
- `PUT /about` - About 페이지 수정 (인증 필요)

### 업로드
- `POST /uploads/image` - 이미지 업로드 (인증 필요, Cloudflare Images 사용)

## 참고사항

- 이미지 업로드는 Cloudflare Images를 사용합니다.
- Firebase는 Firestore만 사용합니다 (Storage는 사용하지 않음).
- MongoDB 연결은 실제 구현이 필요합니다.

