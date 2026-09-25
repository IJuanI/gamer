#!/bin/bash
# GamER Hub Terraform Setup Script
# This script initializes Terraform and prepares for deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== GamER Hub Terraform Setup ===${NC}\n"

# Configuration
PROJECT_ID="unity-dummy"
REGION="us-central1"
STATE_BUCKET="${PROJECT_ID}-terraform-state"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  State Bucket: $STATE_BUCKET\n"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Terraform
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}✗ Terraform CLI not found. Install from: https://www.terraform.io/downloads${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Terraform $(terraform version -json | jq -r '.terraform_version')${NC}"

# Check gcloud (optional, just for information)
if command -v gcloud &> /dev/null; then
    GCLOUD_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "not set")
    echo -e "${GREEN}✓ gcloud found (Project: $GCLOUD_PROJECT)${NC}"
else
    echo -e "${YELLOW}⚠ gcloud CLI not found (this is OK, using Application Default Credentials)${NC}"
fi

echo -e "\n${YELLOW}Step 1: Create GCS bucket for Terraform state...${NC}"

# Check if bucket exists
if gsutil ls -b gs://$STATE_BUCKET > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Bucket already exists: gs://$STATE_BUCKET${NC}"
else
    echo "Creating bucket..."
    gsutil mb -p $PROJECT_ID gs://$STATE_BUCKET
    echo -e "${GREEN}✓ Bucket created${NC}"
fi

# Enable versioning
echo "Enabling versioning..."
gsutil versioning set on gs://$STATE_BUCKET
echo -e "${GREEN}✓ Versioning enabled${NC}\n"

echo -e "${YELLOW}Step 2: Initialize Terraform backend...${NC}"
terraform init -backend-config="bucket=$STATE_BUCKET" -upgrade
echo -e "${GREEN}✓ Terraform initialized${NC}\n"

echo -e "${YELLOW}Step 3: Validate Terraform configuration...${NC}"
terraform validate
echo -e "${GREEN}✓ Configuration is valid${NC}\n"

echo -e "${YELLOW}Step 4: Formatting Terraform files...${NC}"
terraform fmt -recursive
echo -e "${GREEN}✓ Files formatted${NC}\n"

echo -e "${BLUE}=== Setup Complete ===${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Set environment variables with your secrets:"
echo ""
echo "   ${BLUE}export TF_VAR_jwt_secret=\$(openssl rand -hex 32)${NC}"
echo "   ${BLUE}export TF_VAR_discord_client_id=\"1553032775924187256\"${NC}"
echo "   ${BLUE}export TF_VAR_discord_client_secret=\"2ztYlziDO5y2yJcOxvFTrOuDB9SoMzlb\"${NC}"
echo "   ${BLUE}export TF_VAR_google_client_id=\"YOUR_GOOGLE_CLIENT_ID\"${NC}"
echo "   ${BLUE}export TF_VAR_google_client_secret=\"YOUR_GOOGLE_CLIENT_SECRET\"${NC}"
echo "   ${BLUE}export TF_VAR_container_image_url=\"gcr.io/unity-dummy/gamer-hub-api:latest\"${NC}"
echo ""
echo "2. Review the deployment plan:"
echo ""
echo "   ${BLUE}terraform plan -out=tfplan${NC}"
echo ""
echo "3. Apply the configuration:"
echo ""
echo "   ${BLUE}terraform apply tfplan${NC}"
echo ""
echo "4. Get the Cloud Run URL:"
echo ""
echo "   ${BLUE}terraform output cloud_run_service_url${NC}"
echo ""
echo -e "${GREEN}Ready to deploy! Run: terraform plan${NC}"
