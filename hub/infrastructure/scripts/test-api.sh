#!/bin/bash
# Test deployed GamER Hub API
# This script verifies that the API is working correctly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== GamER Hub API Test Suite ===${NC}\n"

# Get API URL from Terraform or environment
if [ -z "$API_URL" ]; then
    if [ -d "infrastructure/terraform" ]; then
        cd infrastructure/terraform
        API_URL=$(terraform output -raw cloud_run_service_url 2>/dev/null || echo "")
        cd - > /dev/null
    fi
fi

if [ -z "$API_URL" ]; then
    echo -e "${YELLOW}API_URL not set. Usage:${NC}"
    echo "  export API_URL=https://your-api-url.run.app"
    echo "  bash infrastructure/scripts/test-api.sh"
    exit 1
fi

echo -e "${YELLOW}Testing API:${NC} ${BLUE}$API_URL${NC}\n"

# Test counters
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local path=$3
    local expected_code=$4

    echo -n "Testing $name... "

    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$path")
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ ($http_code)${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ (Expected: $expected_code, Got: $http_code)${NC}"
        echo "  Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# ==============================================================================
# Basic Health Checks
# ==============================================================================

echo -e "${YELLOW}Health Checks:${NC}"
test_endpoint "Health check" "GET" "/api/health" "200"
echo ""

# ==============================================================================
# Authentication Endpoints
# ==============================================================================

echo -e "${YELLOW}Authentication Endpoints:${NC}"

# Discord OAuth
echo -n "Testing Discord OAuth redirect... "
discord_url=$(curl -s -L -w "\n%{url_effective}" "$API_URL/api/auth/discord" 2>/dev/null | tail -1)
if echo "$discord_url" | grep -q "discord.com"; then
    echo -e "${GREEN}✓${NC}"
    echo "  URL: ${BLUE}$discord_url${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗${NC}"
    echo "  Got: $discord_url"
    FAILED=$((FAILED + 1))
fi

# Google OAuth
echo -n "Testing Google OAuth redirect... "
google_url=$(curl -s -L -w "\n%{url_effective}" "$API_URL/api/auth/google" 2>/dev/null | tail -1)
if echo "$google_url" | grep -q "google.com"; then
    echo -e "${GREEN}✓${NC}"
    echo "  URL: ${BLUE}$google_url${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗${NC}"
    echo "  Got: $google_url"
    FAILED=$((FAILED + 1))
fi

echo ""

# ==============================================================================
# HTTPS Verification
# ==============================================================================

echo -e "${YELLOW}HTTPS/TLS Verification:${NC}"

# Check if using HTTPS
if [[ "$API_URL" == https://* ]]; then
    echo -e "${GREEN}✓ HTTPS protocol confirmed${NC}"
    PASSED=$((PASSED + 1))

    # Check certificate
    echo -n "Checking TLS certificate... "
    cert_check=$(echo | openssl s_client -servername $(echo $API_URL | sed 's|https://||;s|/.*||') -connect $(echo $API_URL | sed 's|https://||;s|/.*||'):443 2>/dev/null | grep -c "Verify return code" || echo 0)
    if [ $cert_check -gt 0 ]; then
        echo -e "${GREEN}✓${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Could not verify (may be firewall)${NC}"
    fi
else
    echo -e "${RED}✗ Not using HTTPS${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""

# ==============================================================================
# Response Validation
# ==============================================================================

echo -e "${YELLOW}Response Validation:${NC}"

echo -n "Testing response format (JSON)... "
health=$(curl -s "$API_URL/api/health")
if echo "$health" | grep -q '"status"'; then
    echo -e "${GREEN}✓${NC}"
    echo "  Response: ${BLUE}$health${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""

# ==============================================================================
# Performance Test
# ==============================================================================

echo -e "${YELLOW}Performance Test:${NC}"

echo -n "Testing response time... "
start=$(date +%s%N)
curl -s "$API_URL/api/health" > /dev/null
end=$(date +%s%N)
elapsed=$(( (end - start) / 1000000 ))

if [ $elapsed -lt 1000 ]; then
    echo -e "${GREEN}✓ ${elapsed}ms${NC}"
    PASSED=$((PASSED + 1))
elif [ $elapsed -lt 3000 ]; then
    echo -e "${YELLOW}⚠ ${elapsed}ms (slow but acceptable)${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ ${elapsed}ms (too slow)${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""

# ==============================================================================
# Summary
# ==============================================================================

TOTAL=$((PASSED + FAILED))

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""
echo "Passed: ${GREEN}$PASSED${NC}"
echo "Failed: ${RED}$FAILED${NC}"
echo "Total:  $TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! API is working.${NC}"
    echo ""
    echo "Frontend can now use:"
    echo -e "  ${BLUE}NEXT_PUBLIC_API_URL=$API_URL${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Check the API logs:${NC}"
    echo -e "  ${BLUE}gcloud run logs read gamer-hub-api --limit=50${NC}"
    exit 1
fi
