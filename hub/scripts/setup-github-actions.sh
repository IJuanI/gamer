#!/bin/bash
# Setup GitHub Actions for automated Cloud Run deployments
# Usage: ./scripts/setup-github-actions.sh

set -e

PROJECT_ID="${GCP_PROJECT:-unity-dummy}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="gamer-hub-api"
SERVICE_ACCOUNT="gamer-hub-api"

echo "🔧 GitHub Actions Setup for $SERVICE_NAME"
echo "==============================================="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if service account exists
if ! gcloud iam service-accounts describe "${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" --project="$PROJECT_ID" >/dev/null 2>&1; then
    echo "❌ Service account ${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com not found"
    echo "Run: terraform apply in infrastructure/terraform/"
    exit 1
fi

# Create service account key
echo "📝 Creating service account key..."
KEY_FILE="gamer-hub-sa-key.json"
gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account="${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --project="$PROJECT_ID"

echo "✅ Key created: $KEY_FILE"
echo ""

# Encode to base64
echo "🔐 Encoding key for GitHub..."
if command -v base64 &> /dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        BASE64_KEY=$(base64 "$KEY_FILE")
        echo "📋 Paste this into GitHub (Settings → Secrets → GCP_SERVICE_ACCOUNT_KEY):"
        echo "$BASE64_KEY" | pbcopy
        echo "✅ Copied to clipboard!"
    else
        # Linux
        BASE64_KEY=$(base64 -w 0 "$KEY_FILE")
        echo "📋 GitHub Secret (GCP_SERVICE_ACCOUNT_KEY):"
        echo "$BASE64_KEY"
    fi
fi

echo ""
echo "🚀 Next steps:"
echo "1. Go to: https://github.com/gamedevs/gamer/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Name: GCP_SERVICE_ACCOUNT_KEY"
echo "4. Value: [Paste the base64 key above]"
echo "5. Also add GCP_PROJECT secret with value: $PROJECT_ID"
echo ""
echo "⚠️  Security Note:"
echo "   - Never commit $KEY_FILE to git"
echo "   - Delete the local key file after adding to GitHub"
echo "   - Rotate keys periodically"
echo ""
echo "rm -f $KEY_FILE  # Remove after adding to GitHub"
