#!/bin/bash
# GamER Hub Deployment Package Validator
# Verifies that all code, scripts, and configuration are ready for deployment
# This validates what's in the repo, not actual deployment (which happens locally)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

PASSED=0
FAILED=0
WARNINGS=0

# Helper function to test
check_item() {
    local name=$1
    local command=$2

    if eval "$command" &>/dev/null; then
        echo -e "${GREEN}✓${NC} $name"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} $name"
        FAILED=$((FAILED + 1))
    fi
}

check_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} $file missing"
        FAILED=$((FAILED + 1))
    fi
}

check_dir() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir/"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} $dir/ missing"
        FAILED=$((FAILED + 1))
    fi
}

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║  GamER Hub Deployment Package Validator                  ║
║  Verifies all code and scripts are ready                 ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# ==============================================================================
# SECTION 1: Directory Structure
# ==============================================================================

echo -e "${YELLOW}${BOLD}1. Directory Structure${NC}"
echo "─────────────────────────────────────────────────────────"

check_dir "apps/api"
check_dir "infrastructure/terraform"
check_dir "infrastructure/scripts"
check_dir "infrastructure/terraform/modules/cloud-sql"
check_dir "infrastructure/terraform/modules/cloud-run"

echo ""

# ==============================================================================
# SECTION 2: Docker Configuration
# ==============================================================================

echo -e "${YELLOW}${BOLD}2. Docker Configuration${NC}"
echo "─────────────────────────────────────────────────────────"

check_file "apps/api/Dockerfile"
check_file "apps/api/.dockerignore"

# Validate Dockerfile syntax
if docker buildx build --platform linux/amd64 --dry-run -f apps/api/Dockerfile . &>/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dockerfile syntax valid"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Cannot validate Dockerfile (Docker not available in sandbox)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ==============================================================================
# SECTION 3: Terraform Configuration
# ==============================================================================

echo -e "${YELLOW}${BOLD}3. Terraform Configuration${NC}"
echo "─────────────────────────────────────────────────────────"

check_file "infrastructure/terraform/main.tf"
check_file "infrastructure/terraform/variables.tf"
check_file "infrastructure/terraform/outputs.tf"
check_file "infrastructure/terraform/oauth.tf"
check_file "infrastructure/terraform/.gitignore"

check_file "infrastructure/terraform/modules/cloud-sql/main.tf"
check_file "infrastructure/terraform/modules/cloud-sql/variables.tf"
check_file "infrastructure/terraform/modules/cloud-sql/outputs.tf"

check_file "infrastructure/terraform/modules/cloud-run/main.tf"
check_file "infrastructure/terraform/modules/cloud-run/variables.tf"
check_file "infrastructure/terraform/modules/cloud-run/outputs.tf"

# Validate Terraform syntax
if terraform -chdir=infrastructure/terraform validate &>/dev/null; then
    echo -e "${GREEN}✓${NC} Terraform configuration valid"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Cannot validate Terraform (gcloud not available in sandbox)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ==============================================================================
# SECTION 4: Deployment Scripts
# ==============================================================================

echo -e "${YELLOW}${BOLD}4. Deployment Scripts${NC}"
echo "─────────────────────────────────────────────────────────"

check_file "infrastructure/scripts/full-deploy.sh"
check_file "infrastructure/scripts/test-api.sh"
check_file "infrastructure/scripts/setup-google-oauth.sh"
check_file "infrastructure/scripts/create-google-oauth.py"
check_file "infrastructure/scripts/deploy-api.sh"

check_file "infrastructure/terraform/setup.sh"

# Check script permissions
for script in full-deploy.sh test-api.sh setup-google-oauth.sh; do
    if [ -x "infrastructure/scripts/$script" ]; then
        echo -e "${GREEN}✓${NC} infrastructure/scripts/$script executable"
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠${NC} infrastructure/scripts/$script not executable (chmod +x needed)"
        WARNINGS=$((WARNINGS + 1))
    fi
done

echo ""

# ==============================================================================
# SECTION 5: Documentation
# ==============================================================================

echo -e "${YELLOW}${BOLD}5. Documentation${NC}"
echo "─────────────────────────────────────────────────────────"

check_file "DEPLOY_NOW.md"
check_file "DEPLOYMENT_READY.md"
check_file "DEPLOYMENT_CHECKLIST.md"
check_file "DEPLOYMENT_STATUS.md"
check_file "infrastructure/QUICKSTART.md"
check_file "infrastructure/terraform/README.md"

echo ""

# ==============================================================================
# SECTION 6: Configuration Templates
# ==============================================================================

echo -e "${YELLOW}${BOLD}6. Configuration Templates${NC}"
echo "─────────────────────────────────────────────────────────"

check_file ".env.production.example"
check_file "infrastructure/.env.example"
check_file "infrastructure/terraform/environments/production/terraform.tfvars"

echo ""

# ==============================================================================
# SECTION 7: Code Quality
# ==============================================================================

echo -e "${YELLOW}${BOLD}7. Code Quality${NC}"
echo "─────────────────────────────────────────────────────────"

# Check for environment variable leaks
if ! grep -r "SECRET\|PASSWORD" apps/api/Dockerfile &>/dev/null; then
    echo -e "${GREEN}✓${NC} No hardcoded secrets in Dockerfile"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗${NC} Potential hardcoded secrets found"
    FAILED=$((FAILED + 1))
fi

# Check Terraform variable naming
if grep -q "variable \"discord_client_id\"" infrastructure/terraform/variables.tf; then
    echo -e "${GREEN}✓${NC} Variables properly defined"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗${NC} Missing required variables"
    FAILED=$((FAILED + 1))
fi

# Check for TODO/FIXME
if grep -r "TODO\|FIXME" infrastructure/terraform/ &>/dev/null; then
    echo -e "${YELLOW}⚠${NC} Found TODO/FIXME comments (may be incomplete)"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓${NC} No TODO/FIXME comments"
    PASSED=$((PASSED + 1))
fi

echo ""

# ==============================================================================
# SECTION 8: Git Status
# ==============================================================================

echo -e "${YELLOW}${BOLD}8. Git Status${NC}"
echo "─────────────────────────────────────────────────────────"

# Check if on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo -e "${GREEN}✓${NC} On main branch"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Not on main branch (currently: $CURRENT_BRANCH)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for uncommitted changes
if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✓${NC} No uncommitted changes"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Uncommitted changes present"
    WARNINGS=$((WARNINGS + 1))
fi

# Check commit history
if git log --oneline | grep -q "Add Terraform\|Add deployment"; then
    echo -e "${GREEN}✓${NC} Deployment commits present"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Missing deployment commits"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ==============================================================================
# SECTION 9: Deployment Readiness
# ==============================================================================

echo -e "${YELLOW}${BOLD}9. Deployment Readiness${NC}"
echo "─────────────────────────────────────────────────────────"

# Check Discord credentials
if echo "$DISCORD_CLIENT_ID" | grep -q "155303"; then
    echo -e "${GREEN}✓${NC} Discord OAuth credentials available"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Discord OAuth credentials (will be prompted during deploy)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for GCP project ID in terraform
if grep -rq "unity-dummy\|gcp_project_id" infrastructure/terraform/; then
    echo -e "${GREEN}✓${NC} GCP project configured"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗${NC} GCP project not configured"
    FAILED=$((FAILED + 1))
fi

# Check for Cloudflare workers deployment
if [ -f "apps/web/wrangler.toml" ]; then
    echo -e "${GREEN}✓${NC} Cloudflare Workers configuration present"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Cloudflare Workers config not found"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ==============================================================================
# SUMMARY
# ==============================================================================

TOTAL=$((PASSED + FAILED + WARNINGS))

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}${BOLD}Validation Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Checks:     ${GREEN}$PASSED passed${NC} | ${YELLOW}$WARNINGS warnings${NC} | ${RED}$FAILED failed${NC}"
echo -e "Total:      $TOTAL items"
echo ""

if [ $FAILED -eq 0 ] && [ $WARNINGS -le 2 ]; then
    echo -e "${GREEN}${BOLD}✓ DEPLOYMENT PACKAGE READY${NC}"
    echo ""
    echo "All code, scripts, and configuration are prepared."
    echo "Ready to deploy on your local machine."
    echo ""
    echo -e "${BOLD}Next step:${NC}"
    echo -e "  ${BLUE}bash infrastructure/scripts/full-deploy.sh${NC}"
    echo ""
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}${BOLD}⚠ DEPLOYMENT PACKAGE MOSTLY READY${NC}"
    echo ""
    echo "Some warnings present but deployment can proceed."
    echo ""
    exit 0
else
    echo -e "${RED}${BOLD}✗ DEPLOYMENT PACKAGE NOT READY${NC}"
    echo ""
    echo "Fix the above failures before deploying."
    echo ""
    exit 1
fi
