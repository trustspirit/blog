#!/bin/bash

# GCP Deployment Script for Blog API
# This script builds and deploys the API to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-blog-api}"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
# Or use Artifact Registry: IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${SERVICE_NAME}/${SERVICE_NAME}"

# Check if required tools are installed
check_dependencies() {
  echo -e "${YELLOW}Checking dependencies...${NC}"
  
  if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
  fi
  
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Install it from: https://docs.docker.com/get-docker/"
    exit 1
  fi
  
  echo -e "${GREEN}All dependencies are installed.${NC}"
}

# Check if user is authenticated
check_auth() {
  echo -e "${YELLOW}Checking GCP authentication...${NC}"
  
  if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}Error: Not authenticated with GCP.${NC}"
    echo "Run: gcloud auth login"
    exit 1
  fi
  
  echo -e "${GREEN}Authenticated with GCP.${NC}"
}

# Set GCP project
set_project() {
  if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}GCP_PROJECT_ID not set. Using current gcloud project...${NC}"
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    
    if [ -z "$PROJECT_ID" ]; then
      echo -e "${RED}Error: No GCP project set.${NC}"
      echo "Set it with: export GCP_PROJECT_ID=your-project-id"
      echo "Or: gcloud config set project YOUR_PROJECT_ID"
      exit 1
    fi
  fi
  
  echo -e "${GREEN}Using GCP project: ${PROJECT_ID}${NC}"
  gcloud config set project "$PROJECT_ID"
  
  IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
}

# Enable required APIs
enable_apis() {
  echo -e "${YELLOW}Enabling required GCP APIs...${NC}"
  gcloud services enable cloudbuild.googleapis.com
  gcloud services enable run.googleapis.com
  gcloud services enable containerregistry.googleapis.com
  echo -e "${GREEN}APIs enabled.${NC}"
}

# Configure Docker for GCP
configure_docker() {
  echo -e "${YELLOW}Configuring Docker for GCP...${NC}"
  gcloud auth configure-docker
  echo -e "${GREEN}Docker configured.${NC}"
}

# Build Docker image
build_image() {
  echo -e "${YELLOW}Building Docker image...${NC}"
  cd "$(dirname "$0")"
  
  docker build \
    -f apps/api/Dockerfile \
    -t "$IMAGE_NAME:latest" \
    -t "$IMAGE_NAME:$(date +%Y%m%d-%H%M%S)" \
    apps/api
  
  echo -e "${GREEN}Docker image built successfully.${NC}"
}

# Push image to GCR
push_image() {
  echo -e "${YELLOW}Pushing image to Google Container Registry...${NC}"
  docker push "$IMAGE_NAME:latest"
  echo -e "${GREEN}Image pushed successfully.${NC}"
}

# Deploy to Cloud Run
deploy_service() {
  echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
  
  # Check if service exists
  if gcloud run services describe "$SERVICE_NAME" --region="$REGION" &>/dev/null; then
    echo -e "${YELLOW}Service exists. Updating...${NC}"
    UPDATE_FLAG="--update-env-vars"
  else
    echo -e "${YELLOW}Service does not exist. Creating...${NC}"
    UPDATE_FLAG="--set-env-vars"
  fi
  
  # Deploy with environment variables
  gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE_NAME:latest" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --port 3010 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --concurrency 80 \
    $UPDATE_FLAG "PORT=3010" \
    --quiet
  
  # Get service URL
  SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --region="$REGION" \
    --format="value(status.url)")
  
  echo -e "${GREEN}Service deployed successfully!${NC}"
  echo -e "${GREEN}Service URL: ${SERVICE_URL}${NC}"
}

# Main deployment function
main() {
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  GCP Cloud Run Deployment Script${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  
  check_dependencies
  check_auth
  set_project
  enable_apis
  configure_docker
  build_image
  push_image
  deploy_service
  
  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  Deployment Complete!${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "1. Set environment variables in Cloud Run:"
  echo "   gcloud run services update $SERVICE_NAME --region=$REGION \\"
  echo "     --set-env-vars=\"MONGODB_URI=your-mongodb-uri\" \\"
  echo "     --set-env-vars=\"JWT_SECRET=your-jwt-secret\" \\"
  echo "     --set-env-vars=\"FRONTEND_URL=your-frontend-url\""
  echo ""
  echo "2. Or use Secret Manager for sensitive values:"
  echo "   gcloud secrets create mongodb-uri --data-file=-"
  echo "   gcloud run services update $SERVICE_NAME --region=$REGION \\"
  echo "     --set-secrets=\"MONGODB_URI=mongodb-uri:latest\""
  echo ""
}

# Run main function
main "$@"

