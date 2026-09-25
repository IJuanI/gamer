#!/bin/bash
# GamER Hub Deployment Script for GCP

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== GamER Hub API Deployment Script ===${NC}\n"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
command -v gcloud >/dev/null 2>&1 || { echo -e "${RED}gcloud CLI is required but not installed.${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed.${NC}"; exit 1; }

echo -e "${GREEN}✓ gcloud found${NC}"
echo -e "${GREEN}✓ docker found${NC}\n"

# Get GCP project
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}No GCP project configured. Run: gcloud config set project YOUR_PROJECT_ID${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Project: $PROJECT_ID${NC}\n"

# Set variables
IMAGE_NAME="gcr.io/${PROJECT_ID}/gamer-hub-api"
IMAGE_TAG="latest"
REGION="us-central1"
SERVICE_NAME="gamer-hub-api"

# Step 1: Build Docker image
echo -e "${YELLOW}Step 1: Building Docker image...${NC}"
docker build \
  -f apps/api/Dockerfile \
  -t ${IMAGE_NAME}:${IMAGE_TAG} \
  .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}\n"
else
    echo -e "${RED}✗ Failed to build Docker image${NC}"
    exit 1
fi

# Step 2: Push to Container Registry
echo -e "${YELLOW}Step 2: Pushing image to Google Container Registry...${NC}"
docker push ${IMAGE_NAME}:${IMAGE_TAG}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Image pushed successfully${NC}\n"
else
    echo -e "${RED}✗ Failed to push image${NC}"
    exit 1
fi

# Step 3: Check environment variables
echo -e "${YELLOW}Step 3: Checking for required environment variables...${NC}"
REQUIRED_VARS=(
    "JWT_SECRET"
    "DATABASE_URL"
    "DISCORD_CLIENT_ID"
    "DISCORD_CLIENT_SECRET"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "WEB_ORIGIN"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}✗ Missing environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo -e "\n${YELLOW}Please set these variables before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All required environment variables set${NC}\n"

# Step 4: Deploy to Cloud Run
echo -e "${YELLOW}Step 4: Deploying to Cloud Run...${NC}"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo "Image: $IMAGE_NAME:$IMAGE_TAG\n"

gcloud run deploy $SERVICE_NAME \
  --image=${IMAGE_NAME}:${IMAGE_TAG} \
  --platform=managed \
  --region=${REGION} \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --timeout=300 \
  --set-env-vars=NODE_ENV=production \
  --set-env-vars=JWT_SECRET=${JWT_SECRET} \
  --set-env-vars=WEB_ORIGIN=${WEB_ORIGIN} \
  --set-env-vars=DATABASE_URL=${DATABASE_URL} \
  --set-env-vars=DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID} \
  --set-env-vars=DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET} \
  --set-env-vars=GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID} \
  --set-env-vars=GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployed successfully${NC}\n"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi

# Step 5: Get service URL
echo -e "${YELLOW}Step 5: Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=${REGION} --format="value(status.url)")
echo -e "${GREEN}✓ Service URL: ${SERVICE_URL}${NC}\n"

# Step 6: Test the API
echo -e "${YELLOW}Step 6: Testing the API...${NC}"
sleep 5  # Wait for service to be ready
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" ${SERVICE_URL}/api/health)

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ API is healthy${NC}\n"
else
    echo -e "${YELLOW}⚠ API returned status code: $HEALTH_RESPONSE${NC}"
    echo -e "${YELLOW}This may be normal if the API hasn't fully started yet.${NC}\n"
fi

# Summary
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "${GREEN}API URL: ${SERVICE_URL}${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update NEXT_PUBLIC_API_URL in your frontend deployment"
echo "2. Test the OAuth flows"
echo "3. Monitor logs: gcloud run logs read $SERVICE_NAME --limit=50"
echo "4. View metrics: https://console.cloud.google.com/run"
