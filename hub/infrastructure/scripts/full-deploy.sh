#!/bin/bash
# GamER Hub Complete Production Deployment
# This script handles everything: OAuth, Docker, Terraform, Frontend
# Run this on your local machine (not in this sandbox)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ID="unity-dummy"
REGION="us-central1"
SERVICE_NAME="gamer-hub-api"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
STATE_BUCKET="${PROJECT_ID}-terraform-state"

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         GamER Hub - Complete Production Deployment        ║
║                                                            ║
║  This script will:                                         ║
║  1. Create Google OAuth credentials                       ║
║  2. Build and push Docker image                           ║
║  3. Initialize Terraform backend                          ║
║  4. Deploy infrastructure (Firestore + Cloud Run)         ║
║  5. Update frontend configuration                         ║
║  6. Verify the API is working                             ║
║                                                            ║
║  Estimated time: 30-40 minutes                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# ==============================================================================
# STEP 1: Check Prerequisites
# ==============================================================================

echo -e "${YELLOW}STEP 1: Checking Prerequisites${NC}\n"

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 not found${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ $1${NC}"
    return 0
}

check_command "docker" || exit 1
check_command "terraform" || exit 1
check_command "gcloud" || exit 1
check_command "curl" || exit 1

echo ""

# ==============================================================================
# STEP 2: Google OAuth Setup
# ==============================================================================

echo -e "${YELLOW}STEP 2: Google OAuth Credentials${NC}\n"

if [ -z "$TF_VAR_google_client_id" ]; then
    echo "Running OAuth setup helper..."
    bash infrastructure/scripts/setup-google-oauth.sh
else
    echo -e "${GREEN}✓ Google OAuth credentials already set${NC}"
fi

echo ""

# ==============================================================================
# STEP 3: Prepare Environment
# ==============================================================================

echo -e "${YELLOW}STEP 3: Validating Environment Variables${NC}\n"

REQUIRED_VARS=(
    "TF_VAR_discord_client_id"
    "TF_VAR_discord_client_secret"
    "TF_VAR_google_client_id"
    "TF_VAR_google_client_secret"
    "TF_VAR_jwt_secret"
)

MISSING=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING+=("$var")
    else
        echo -e "${GREEN}✓ ${var}${NC}"
    fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
    echo -e "\n${RED}Missing environment variables:${NC}"
    for var in "${MISSING[@]}"; do
        echo "  export $var=VALUE"
    done
    exit 1
fi

export TF_VAR_container_image_url="$IMAGE_NAME:latest"

echo ""

# ==============================================================================
# STEP 4: Build Docker Image
# ==============================================================================

echo -e "${YELLOW}STEP 4: Building Docker Image${NC}\n"

docker build \
    -f apps/api/Dockerfile \
    -t $IMAGE_NAME:latest \
    -t $IMAGE_NAME:$(date +%s) \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built${NC}\n"
else
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi

# ==============================================================================
# STEP 5: Authenticate and Push to GCR
# ==============================================================================

echo -e "${YELLOW}STEP 5: Pushing to Google Container Registry${NC}\n"

gcloud auth configure-docker
docker push $IMAGE_NAME:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Image pushed to GCR${NC}\n"
else
    echo -e "${RED}✗ Push failed${NC}"
    exit 1
fi

# ==============================================================================
# STEP 6: Initialize Terraform Backend
# ==============================================================================

echo -e "${YELLOW}STEP 6: Initializing Terraform Backend${NC}\n"

echo "Creating GCS bucket for state..."
gsutil mb -p $PROJECT_ID gs://$STATE_BUCKET 2>/dev/null || echo "Bucket already exists"
gsutil versioning set on gs://$STATE_BUCKET

cd infrastructure/terraform

echo "Initializing Terraform..."
terraform init -backend-config="bucket=$STATE_BUCKET" -upgrade

terraform validate

echo -e "${GREEN}✓ Terraform initialized${NC}\n"

# ==============================================================================
# STEP 7: Terraform Plan
# ==============================================================================

echo -e "${YELLOW}STEP 7: Planning Infrastructure Changes${NC}\n"

terraform plan -out=tfplan

echo ""
read -p "Review the plan above. Continue with deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# ==============================================================================
# STEP 8: Terraform Apply
# ==============================================================================

echo -e "${YELLOW}STEP 8: Deploying Infrastructure${NC}\n"

terraform apply tfplan

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Terraform apply failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Infrastructure deployed${NC}\n"

# ==============================================================================
# STEP 9: Get Outputs
# ==============================================================================

echo -e "${YELLOW}STEP 9: Getting Deployment Outputs${NC}\n"

API_URL=$(terraform output -raw cloud_run_service_url)
DB_CONNECTION=$(terraform output -raw database_connection_name)

echo -e "${GREEN}✓ Deployment Complete!${NC}\n"

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}Deployment Summary${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""
echo "API URL:"
echo -e "  ${BLUE}$API_URL${NC}"
echo ""
echo "Database:"
echo -e "  ${BLUE}$DB_CONNECTION${NC}"
echo ""

cd ../..

# ==============================================================================
# STEP 10: Update Frontend
# ==============================================================================

echo -e "${YELLOW}STEP 10: Updating Frontend${NC}\n"

export NEXT_PUBLIC_API_URL="$API_URL"

echo "Redeploying frontend with new API URL..."
cd apps/web
wrangler deploy
cd ../..

echo -e "${GREEN}✓ Frontend redeployed${NC}\n"

# ==============================================================================
# STEP 11: Verify API
# ==============================================================================

echo -e "${YELLOW}STEP 11: Verifying API${NC}\n"

echo "Waiting for Cloud Run to stabilize..."
sleep 10

echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/health" | tail -1)

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ API is healthy${NC}"
    echo ""
    echo "Testing OAuth endpoints..."
    echo -e "  Discord: ${BLUE}$API_URL/api/auth/discord${NC}"
    echo -e "  Google:  ${BLUE}$API_URL/api/auth/google${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠ API returned status code: $HEALTH_RESPONSE${NC}"
    echo "Check logs: gcloud run logs read gamer-hub-api"
fi

echo ""

# ==============================================================================
# STEP 12: Final Instructions
# ==============================================================================

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}Deployment Complete!${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Test login on frontend:"
echo -e "   ${BLUE}https://gameer.com.ar/registro${NC}"
echo ""
echo "2. Test OAuth flows:"
echo -e "   ${BLUE}curl -L $API_URL/api/auth/discord${NC}"
echo -e "   ${BLUE}curl -L $API_URL/api/auth/google${NC}"
echo ""
echo "3. Unhide jam CTA (once verified):"
echo "   - Edit apps/web/app/jam/page.tsx"
echo "   - Remove style={{ display: \"none\" }} from section#comunidad"
echo "   - Run: cd apps/web && wrangler deploy"
echo ""
echo "4. Monitor:"
echo -e "   ${BLUE}gcloud run logs read gamer-hub-api --limit=50${NC}"
echo ""
echo -e "${GREEN}✓ Production API is live at: $API_URL${NC}"
echo ""
