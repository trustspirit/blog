# Deployment Guide for Blog API

This guide explains how to deploy the Blog API to Google Cloud Platform (GCP) using Cloud Run.

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud SDK**: Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Install [Docker](https://docs.docker.com/get-docker/)
4. **GCP Project**: Create a new project or use an existing one

## Initial Setup

### 1. Authenticate with GCP

```bash
gcloud auth login
gcloud auth application-default login
```

### 2. Set Your Project ID

```bash
export GCP_PROJECT_ID=your-project-id
gcloud config set project $GCP_PROJECT_ID
```

Or set it in the deployment script:
```bash
export GCP_PROJECT_ID=your-project-id
```

### 3. Configure Region (Optional)

Default is `us-central1`. To change:
```bash
export GCP_REGION=us-east1
```

## Deployment

### Quick Deployment

Run the deployment script:

```bash
./deploy-api.sh
```

The script will:
1. Check dependencies
2. Authenticate with GCP
3. Enable required APIs
4. Build the Docker image
5. Push to Google Container Registry
6. Deploy to Cloud Run

### Manual Deployment Steps

If you prefer to deploy manually:

#### 1. Build the Docker Image

```bash
docker build -f apps/api/Dockerfile -t gcr.io/$GCP_PROJECT_ID/blog-api .
```

#### 2. Push to Google Container Registry

```bash
gcloud auth configure-docker
docker push gcr.io/$GCP_PROJECT_ID/blog-api
```

#### 3. Deploy to Cloud Run

```bash
gcloud run deploy blog-api \
  --image gcr.io/$GCP_PROJECT_ID/blog-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3010 \
  --memory 512Mi \
  --cpu 1
```

## Environment Variables

After deployment, set your environment variables:

### Using gcloud CLI

```bash
gcloud run services update blog-api \
  --region us-central1 \
  --set-env-vars="MONGODB_URI=your-mongodb-uri" \
  --set-env-vars="JWT_SECRET=your-jwt-secret" \
  --set-env-vars="FRONTEND_URL=https://your-frontend-url.com" \
  --set-env-vars="GOOGLE_CLIENT_ID=your-google-client-id" \
  --set-env-vars="GOOGLE_CLIENT_SECRET=your-google-client-secret" \
  --set-env-vars="ADMIN_EMAILS=admin@example.com" \
  --set-env-vars="FIREBASE_PROJECT_ID=your-firebase-project-id" \
  --set-env-vars="FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com"
```

### Using Secret Manager (Recommended for Sensitive Data)

For sensitive values like `JWT_SECRET` and `FIREBASE_SERVICE_ACCOUNT`:

#### 1. Create Secrets

```bash
# JWT Secret
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-

# Firebase Service Account (JSON)
gcloud secrets create firebase-service-account --data-file=path/to/service-account.json

# MongoDB URI
echo -n "your-mongodb-uri" | gcloud secrets create mongodb-uri --data-file=-
```

#### 2. Grant Cloud Run Access

```bash
PROJECT_NUMBER=$(gcloud projects describe $GCP_PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding firebase-service-account \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding mongodb-uri \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### 3. Update Service with Secrets

```bash
gcloud run services update blog-api \
  --region us-central1 \
  --set-secrets="JWT_SECRET=jwt-secret:latest,MONGODB_URI=mongodb-uri:latest,FIREBASE_SERVICE_ACCOUNT=firebase-service-account:latest" \
  --set-env-vars="FRONTEND_URL=https://your-frontend-url.com,GOOGLE_CLIENT_ID=your-google-client-id,GOOGLE_CLIENT_SECRET=your-google-client-secret,ADMIN_EMAILS=admin@example.com,FIREBASE_PROJECT_ID=your-firebase-project-id,FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com"
```

## Updating the Service

To update the service with new code:

```bash
./deploy-api.sh
```

Or manually:

```bash
docker build -f apps/api/Dockerfile -t gcr.io/$GCP_PROJECT_ID/blog-api .
docker push gcr.io/$GCP_PROJECT_ID/blog-api
gcloud run services update blog-api --image gcr.io/$GCP_PROJECT_ID/blog-api --region us-central1
```

## Viewing Logs

```bash
gcloud run services logs read blog-api --region us-central1
```

Or follow logs in real-time:

```bash
gcloud run services logs tail blog-api --region us-central1
```

## Service Information

Get the service URL:

```bash
gcloud run services describe blog-api --region us-central1 --format="value(status.url)"
```

## Health Check

The service includes a health check endpoint:

```bash
curl https://your-service-url/health
```

## Cost Optimization

Cloud Run charges based on:
- **CPU and Memory**: Only when handling requests
- **Requests**: Per million requests
- **Duration**: Per 100ms of request handling time

### Tips:
- Set `--min-instances 0` (default) to scale to zero when not in use
- Adjust `--memory` and `--cpu` based on your needs
- Use `--max-instances` to limit costs
- Monitor usage in Cloud Console

## Troubleshooting

### Build Failures

If the Docker build fails:
1. Check that all dependencies are in `package.json`
2. Verify the Dockerfile paths are correct
3. Check Docker logs: `docker build --progress=plain ...`

### Deployment Failures

1. Check GCP quotas: `gcloud compute project-info describe`
2. Verify APIs are enabled: `gcloud services list --enabled`
3. Check service logs: `gcloud run services logs read blog-api --region us-central1`

### Connection Issues

1. Verify environment variables are set correctly
2. Check MongoDB connection string format
3. Ensure Firebase credentials are valid
4. Check Cloud Run service logs

### Performance Issues

1. Increase memory: `--memory 1Gi`
2. Increase CPU: `--cpu 2`
3. Adjust concurrency: `--concurrency 100`
4. Set minimum instances: `--min-instances 1`

## Using Artifact Registry (Alternative)

If you prefer Artifact Registry over Container Registry:

1. Create a repository:
```bash
gcloud artifacts repositories create blog-api-repo \
  --repository-format=docker \
  --location=us-central1
```

2. Update the deployment script to use:
```bash
IMAGE_NAME="us-central1-docker.pkg.dev/${PROJECT_ID}/blog-api-repo/blog-api"
```

3. Configure Docker:
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to GCP

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      - name: Deploy
        run: ./deploy-api.sh
```

## Security Best Practices

1. **Use Secret Manager** for sensitive data
2. **Enable authentication** if the API should be private:
   ```bash
   gcloud run services update blog-api --no-allow-unauthenticated
   ```
3. **Set up IAM** roles properly
4. **Enable VPC** for private MongoDB connections
5. **Use Cloud Armor** for DDoS protection
6. **Enable audit logs** for compliance

## Monitoring

Set up monitoring in Cloud Console:
1. Go to Cloud Run → blog-api → Metrics
2. Set up alerts for errors, latency, and request count
3. Use Cloud Logging for detailed logs
4. Set up uptime checks in Cloud Monitoring

