#!/bin/bash
# GamER Hub API Complete Deployment Script
# This script builds, pushes, and deploys the API to Cloud Run using Terraform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== GamER Hub API Deployment ===${NC}\n"

# Configuration
PROJECT_ID="unity-dummy"
REGION="us-central1"
SERVICE_NAME="gamer-hub-api"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
IMAGE_TAG="${1:-latest}"
STATE_BUCKET="${PROJECT_ID}-terraform-state"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Project: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service: $SERVICE_NAME"
echo "  Image: $IMAGE_NAME:$IMAGE_TAG\n"

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker${NC}"

# Check Terraform
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}✗ Terraform not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Terraform${NC}"

# Check gcloud
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}✗ gcloud not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ gcloud${NC}\n"

# Step 2: Validate environment variables
echo -e "${YELLOW}Step 2: Validating environment variables...${NC}"

REQUIRED_VARS=(
    "TF_VAR_jwt_secret"
    "TF_VAR_discord_client_id"
    "TF_VAR_discord_client_secret"
    "TF_VAR_google_client_id"
    "TF_VAR_google_client_secret"
    "TF_VAR_container_image_url"
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
    exit 1
fi
echo -e "${GREEN}✓ All environment variables set${NC}\n"

# Step 3: Build Docker image
echo -e "${YELLOW}Step 3: Building Docker image...${NC}"
echo "  Image: $IMAGE_NAME:$IMAGE_TAG"

docker build \
    -f apps/api/Dockerfile \
    -t $IMAGE_NAME:$IMAGE_TAG \
    -t $IMAGE_NAME:latest \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built${NC}\n"
else
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi

# Step 4: Configure Docker authentication
echo -e "${YELLOW}Step 4: Configuring Docker authentication...${NC}"
gcloud auth configure-docker
echo -e "${GREEN}✓ Docker configured${NC}\n"

# Step 5: Push image to Container Registry
echo -e "${YELLOW}Step 5: Pushing image to Google Container Registry...${NC}"
docker push $IMAGE_NAME:$IMAGE_TAG
docker push $IMAGE_NAME:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Image pushed${NC}\n"
else
    echo -e "${RED}✗ Push failed${NC}"
    exit 1
fi

# Step 6: Plan Terraform deployment
echo -e "${YELLOW}Step 6: Planning Terraform deployment...${NC}"
cd infrastructure/terraform
terraform init -backend-config="bucket=$STATE_BUCKET" -upgrade

terraform plan -out=tfplan
echo -e "${GREEN}✓ Plan saved to tfplan${NC}\n"

# Step 7: Apply Terraform
echo -e "${YELLOW}Step 7: Applying Terraform configuration...${NC}"
echo -e "${BLUE}This will create/update:${NC}"
echo "  - Cloud SQL PostgreSQL instance"
echo "  - Cloud Run service"
echo "  - Service account and IAM bindings"
echo ""
read -p "Continue with deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

terraform apply tfplan

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment successful${NC}\n"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi

# Step 8: Get outputs
echo -e "${YELLOW}Step 8: Retrieving deployment outputs...${NC}"
CLOUD_RUN_URL=$(terraform output -raw cloud_run_service_url)
DB_CONNECTION=$(terraform output -raw database_connection_name)
DB_PASSWORD=$(terraform output -raw database_password 2>/dev/null || echo "stored in Terraform state")

echo -e "${GREEN}✓ Deployment Complete!${NC}\n"

echo -e "${BLUE}=== Deployment Summary ===${NC}"
echo ""
echo "API URL:"
echo -e "  ${BLUE}$CLOUD_RUN_URL${NC}"
echo ""
echo "Database Connection Name:"
echo -e "  ${BLUE}$DB_CONNECTION${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Update frontend API URL:"
echo -e "   ${BLUE}export NEXT_PUBLIC_API_URL=\"$CLOUD_RUN_URL\"${NC}"
echo ""
echo "2. Redeploy frontend:"
echo -e "   ${BLUE}cd apps/web && wrangler deploy${NC}"
echo ""
echo "3. Test the API:"
echo -e "   ${BLUE}curl $CLOUD_RUN_URL/api/health${NC}"
echo ""
echo "4. Once verified, unhide jam CTA:"
echo -e "   ${BLUE}Edit apps/web/app/jam/page.tsx and remove display:none${NC}"
echo ""
echo -e "${GREEN}Deployment complete!${NC}"
