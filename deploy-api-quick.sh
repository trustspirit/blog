#!/bin/bash

# Quick deployment script - minimal version
# Usage: ./deploy-api-quick.sh [project-id] [region] [service-name]

set -e

PROJECT_ID="${1:-${GCP_PROJECT_ID}}"
REGION="${2:-us-central1}"
SERVICE_NAME="${3:-blog-api}"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: GCP_PROJECT_ID not set"
  echo "Usage: ./deploy-api-quick.sh [project-id] [region] [service-name]"
  echo "Or set: export GCP_PROJECT_ID=your-project-id"
  exit 1
fi

IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Building and deploying to GCP..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Build
docker build -f apps/api/Dockerfile -t "$IMAGE_NAME:latest" apps/api

# Push
gcloud auth configure-docker --quiet
docker push "$IMAGE_NAME:latest"

# Deploy
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_NAME:latest" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 3010 \
  --memory 512Mi \
  --cpu 1 \
  --quiet

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" \
  --format="value(status.url)")

echo ""
echo "✅ Deployment complete!"
echo "Service URL: $SERVICE_URL"
echo ""
echo "Don't forget to set environment variables:"
echo "gcloud run services update $SERVICE_NAME --region=$REGION --set-env-vars=..."

