#!/bin/bash
# GamER Hub Google OAuth Credential Setup Helper
# This script automates the process of creating Google OAuth credentials

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Google OAuth Credential Setup ===${NC}\n"

# Configuration
PROJECT_ID="${1:-unity-dummy}"
REGION="us-central1"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION\n"

# Check if gcloud is available
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}✗ gcloud CLI not found${NC}"
    exit 1
fi

# Check if we're authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${RED}✗ Not authenticated with gcloud${NC}"
    echo "Run: gcloud auth application-default login"
    exit 1
fi

echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Enable APIs
REQUIRED_APIS=(
    "cloudidentity.googleapis.com"
    "iap.googleapis.com"
    "identitytoolkit.googleapis.com"
)

for api in "${REQUIRED_APIS[@]}"; do
    echo "Enabling $api..."
    gcloud services enable "$api" --project=$PROJECT_ID 2>&1 | grep -v "already enabled" || true
done

echo -e "${GREEN}✓ APIs enabled${NC}\n"

echo -e "${YELLOW}Step 2: Attempting to create OAuth credentials via gcloud...${NC}"

# Try using gcloud to create credentials
# Note: This may not work if gcloud doesn't support the command
if gcloud iam oauth-clients create \
    --project=$PROJECT_ID \
    --display-name="GamER Hub API" 2>&1 | grep -q "Command not found\|ERROR"; then

    echo -e "${YELLOW}⚠ Automatic creation via gcloud not available${NC}"
    echo -e "${YELLOW}Using fallback: opening browser to GCP Console...${NC}\n"

    # Open browser to OAuth credentials creation
    CONSOLE_URL="https://console.cloud.google.com/apis/credentials/oauthclient?project=$PROJECT_ID"

    echo "Opening GCP Console..."
    if command -v xdg-open &> /dev/null; then
        xdg-open "$CONSOLE_URL"
    elif command -v open &> /dev/null; then
        open "$CONSOLE_URL"
    elif command -v start &> /dev/null; then
        start "$CONSOLE_URL"
    else
        echo "Please open this URL in your browser:"
        echo -e "${BLUE}$CONSOLE_URL${NC}"
    fi

    echo ""
    echo -e "${YELLOW}Follow these steps:${NC}"
    echo "1. Click '+ Create Credentials' → 'OAuth client ID'"
    echo "2. Application type: 'Web application'"
    echo "3. Name: 'GamER Hub API'"
    echo "4. Add Authorized redirect URIs:"
    echo "   - https://gameer.com.ar/api/auth/google/callback"
    echo "   - https://gameer.com.ar/api/auth/google"
    echo "5. Click 'Create'"
    echo "6. Copy the displayed credentials"
    echo ""
    read -p "Press Enter when you've copied the credentials..."

fi

echo -e "${BLUE}=== OAuth Credentials Created ===${NC}\n"

# Prompt for credentials
echo -e "${YELLOW}Enter your Google OAuth credentials:${NC}"
read -p "Client ID: " GOOGLE_CLIENT_ID
read -sp "Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

# Validate
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo -e "${RED}✗ Credentials not provided${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Credentials entered${NC}\n"

# Generate export commands
echo -e "${BLUE}=== Environment Variables ===${NC}\n"
echo "Add these to your environment:"
echo ""
echo -e "${BLUE}export TF_VAR_google_client_id=\"$GOOGLE_CLIENT_ID\"${NC}"
echo -e "${BLUE}export TF_VAR_google_client_secret=\"$GOOGLE_CLIENT_SECRET\"${NC}"
echo ""

# Option to save to .env file
read -p "Save to infrastructure/.env.local? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ENV_FILE="infrastructure/.env.local"
    echo "Saving to $ENV_FILE..."

    cat >> "$ENV_FILE" <<EOF

# Google OAuth (added $(date))
export TF_VAR_google_client_id="$GOOGLE_CLIENT_ID"
export TF_VAR_google_client_secret="$GOOGLE_CLIENT_SECRET"
EOF

    echo -e "${GREEN}✓ Saved to $ENV_FILE${NC}"
    echo ""
    echo "Load with: source infrastructure/.env.local"
fi

echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "Next: Run deployment script"
echo -e "${BLUE}bash infrastructure/scripts/deploy-api.sh${NC}"
