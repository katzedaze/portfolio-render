#!/usr/bin/env bash
# E2E Test Script for Portfolio API
# Tests the full CRUD flow against a running backend at localhost:8000

set -euo pipefail

BASE_URL="${API_URL:-http://localhost:8000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
TOKEN=""
SKILL_ID=""
PROJECT_ID=""
CONTACT_ID=""

pass() {
  echo -e "${GREEN}[PASS]${NC} $1"
  PASS=$((PASS + 1))
}

fail() {
  echo -e "${RED}[FAIL]${NC} $1"
  FAIL=$((FAIL + 1))
}

# Make an authenticated JSON request and return a combined JSON with __status__
# Usage: json_request METHOD URL [JSON_BODY] [TOKEN]
json_request() {
  local method="$1"
  local url="$2"
  local body="${3:-}"
  local token="${4:-}"

  local args=(-s -L -X "$method")

  args+=(-H "Content-Type: application/json")

  if [ -n "$token" ]; then
    args+=(-H "Authorization: Bearer $token")
  fi

  if [ -n "$body" ]; then
    args+=(-d "$body")
  fi

  # Capture body and status code separately
  local tmp_body
  local http_code
  tmp_body=$(mktemp)
  http_code=$(curl "${args[@]}" -w "%{http_code}" -o "$tmp_body" "$url" 2>/dev/null)
  local body_content
  body_content=$(cat "$tmp_body")
  rm -f "$tmp_body"

  # Merge status into response
  echo "$body_content" | python3 -c "
import sys, json
status = '$http_code'
raw = sys.stdin.read().strip()
try:
    data = json.loads(raw) if raw else {}
    if isinstance(data, list):
        print(json.dumps({'__status__': status, '__list__': data}))
    elif isinstance(data, dict):
        data['__status__'] = status
        print(json.dumps(data))
    else:
        print(json.dumps({'__status__': status, '__data__': data}))
except Exception:
    print(json.dumps({'__status__': status}))
" 2>/dev/null || echo "{\"__status__\": \"$http_code\"}"
}

get_field() {
  local json="$1"
  local field="$2"
  echo "$json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('$field',''))" 2>/dev/null || echo ""
}

echo ""
echo "======================================"
echo "  Portfolio API E2E Test Suite"
echo "======================================"
echo "  Target: $BASE_URL"
echo "  Admin:  $ADMIN_EMAIL"
echo ""

# -------------------------------------------------------------------
# Step 1: Login as admin (POST /api/auth/login)
# -------------------------------------------------------------------
echo "Step 1: Login as admin"
LOGIN_BODY="{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}"
LOGIN_RESPONSE=$(json_request POST "$BASE_URL/api/auth/login" "$LOGIN_BODY")
LOGIN_STATUS=$(get_field "$LOGIN_RESPONSE" "__status__")
TOKEN=$(get_field "$LOGIN_RESPONSE" "access_token")

if [ "$LOGIN_STATUS" = "200" ] && [ -n "$TOKEN" ]; then
  pass "Step 1: Login as admin (POST /api/auth/login)"
else
  fail "Step 1: Login as admin (got status=$LOGIN_STATUS)"
  echo "  Response: $LOGIN_RESPONSE"
  echo ""
  echo "======================================"
  echo "  Results: 0 passed, 1 failed"
  echo "  Cannot continue without auth token"
  echo "======================================"
  exit 1
fi

# -------------------------------------------------------------------
# Step 2: Create a skill (POST /api/skills with auth)
# -------------------------------------------------------------------
echo "Step 2: Create a skill"
SKILL_BODY='{"name":"E2E Test Skill","category":"E2E Testing","proficiency":75,"sort_order":0}'
CREATE_SKILL_RESPONSE=$(json_request POST "$BASE_URL/api/skills/" "$SKILL_BODY" "$TOKEN")
CREATE_SKILL_STATUS=$(get_field "$CREATE_SKILL_RESPONSE" "__status__")
SKILL_ID=$(get_field "$CREATE_SKILL_RESPONSE" "id")

if [ "$CREATE_SKILL_STATUS" = "201" ] && [ -n "$SKILL_ID" ] && [ "$SKILL_ID" != "" ]; then
  pass "Step 2: Create a skill (POST /api/skills) -> id=$SKILL_ID"
else
  fail "Step 2: Create a skill (got status=$CREATE_SKILL_STATUS)"
  echo "  Response: $CREATE_SKILL_RESPONSE"
  SKILL_ID=""
fi

# -------------------------------------------------------------------
# Step 3: Create a project with that skill (POST /api/projects with auth)
# -------------------------------------------------------------------
echo "Step 3: Create a project"
SKILL_IDS_JSON="[]"
if [ -n "$SKILL_ID" ]; then
  SKILL_IDS_JSON="[$SKILL_ID]"
fi

PROJECT_BODY=$(python3 -c "
import json
data = {
    'title': 'E2E Test Project',
    'slug': 'e2e-test-project-$(date +%s)',
    'description': 'A project created during E2E testing',
    'content': 'Detailed content for the E2E test project',
    'is_published': True,
    'is_featured': False,
    'sort_order': 99,
    'skill_ids': $SKILL_IDS_JSON
}
print(json.dumps(data))
")

CREATE_PROJECT_RESPONSE=$(json_request POST "$BASE_URL/api/projects/" "$PROJECT_BODY" "$TOKEN")
CREATE_PROJECT_STATUS=$(get_field "$CREATE_PROJECT_RESPONSE" "__status__")
PROJECT_ID=$(get_field "$CREATE_PROJECT_RESPONSE" "id")

if [ "$CREATE_PROJECT_STATUS" = "201" ] && [ -n "$PROJECT_ID" ] && [ "$PROJECT_ID" != "" ]; then
  pass "Step 3: Create a project (POST /api/projects) -> id=$PROJECT_ID"
else
  fail "Step 3: Create a project (got status=$CREATE_PROJECT_STATUS)"
  echo "  Response: $CREATE_PROJECT_RESPONSE"
  PROJECT_ID=""
fi

# -------------------------------------------------------------------
# Step 4: Verify project appears in public list (GET /api/projects)
# -------------------------------------------------------------------
echo "Step 4: Verify project appears in public list"
LIST_RESPONSE=$(json_request GET "$BASE_URL/api/projects/")
LIST_STATUS=$(get_field "$LIST_RESPONSE" "__status__")

PROJECT_FOUND=0
if [ -n "$PROJECT_ID" ] && [ "$LIST_STATUS" = "200" ]; then
  PROJECT_FOUND=$(echo "$LIST_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
projects = data.get('__list__', data if isinstance(data, list) else [])
pid = $PROJECT_ID
found = any(str(p.get('id', '')) == str(pid) for p in projects)
print(1 if found else 0)
" 2>/dev/null || echo "0")
fi

if [ "$LIST_STATUS" = "200" ] && [ "$PROJECT_FOUND" = "1" ]; then
  pass "Step 4: Project appears in public list (GET /api/projects)"
elif [ "$LIST_STATUS" = "200" ] && [ -z "$PROJECT_ID" ]; then
  fail "Step 4: Cannot verify project in list (project creation failed)"
else
  fail "Step 4: Project not found in public list (status=$LIST_STATUS, found=$PROJECT_FOUND)"
fi

# -------------------------------------------------------------------
# Step 5: Verify project detail is accessible (GET /api/projects/{id})
# -------------------------------------------------------------------
echo "Step 5: Verify project detail is accessible"
if [ -n "$PROJECT_ID" ]; then
  DETAIL_RESPONSE=$(json_request GET "$BASE_URL/api/projects/$PROJECT_ID")
  DETAIL_STATUS=$(get_field "$DETAIL_RESPONSE" "__status__")
  DETAIL_TITLE=$(get_field "$DETAIL_RESPONSE" "title")

  if [ "$DETAIL_STATUS" = "200" ] && [ "$DETAIL_TITLE" = "E2E Test Project" ]; then
    pass "Step 5: Project detail accessible (GET /api/projects/$PROJECT_ID)"
  else
    fail "Step 5: Project detail not accessible (status=$DETAIL_STATUS, title='$DETAIL_TITLE')"
    echo "  Response: $DETAIL_RESPONSE"
  fi
else
  fail "Step 5: Cannot test project detail (project creation failed)"
fi

# -------------------------------------------------------------------
# Step 6: Get profile or create one (PUT /api/profile with auth)
# -------------------------------------------------------------------
echo "Step 6: Get/update profile"
PROFILE_BODY='{"name":"E2E Test Admin","title":"Full Stack Developer","bio":"E2E test profile - automated testing biography text","email":"admin@example.com","is_available":true}'
UPDATE_PROFILE_RESPONSE=$(json_request PUT "$BASE_URL/api/profile" "$PROFILE_BODY" "$TOKEN")
UPDATE_PROFILE_STATUS=$(get_field "$UPDATE_PROFILE_RESPONSE" "__status__")

if [ "$UPDATE_PROFILE_STATUS" = "200" ] || [ "$UPDATE_PROFILE_STATUS" = "201" ]; then
  pass "Step 6: Get/update profile (PUT /api/profile)"
else
  fail "Step 6: Profile update failed (got status=$UPDATE_PROFILE_STATUS)"
  echo "  Response: $UPDATE_PROFILE_RESPONSE"
fi

# -------------------------------------------------------------------
# Step 7: Submit a contact message (POST /api/contact)
# -------------------------------------------------------------------
echo "Step 7: Submit a contact message"
CONTACT_BODY='{"name":"E2E Tester","email":"e2e-test@example.com","subject":"Automated E2E Test Message","message":"This is an automated E2E test message to verify the contact form submission works correctly."}'
CONTACT_RESPONSE=$(json_request POST "$BASE_URL/api/contact/" "$CONTACT_BODY")
CONTACT_STATUS=$(get_field "$CONTACT_RESPONSE" "__status__")
CONTACT_ID=$(get_field "$CONTACT_RESPONSE" "id")

if [ "$CONTACT_STATUS" = "201" ] && [ -n "$CONTACT_ID" ] && [ "$CONTACT_ID" != "" ]; then
  pass "Step 7: Submit a contact message (POST /api/contact) -> id=$CONTACT_ID"
else
  fail "Step 7: Contact message submission failed (got status=$CONTACT_STATUS)"
  echo "  Response: $CONTACT_RESPONSE"
  CONTACT_ID=""
fi

# -------------------------------------------------------------------
# Step 8: Verify message appears in admin list (GET /api/contact with auth)
# -------------------------------------------------------------------
echo "Step 8: Verify message appears in admin list"
MESSAGES_RESPONSE=$(json_request GET "$BASE_URL/api/contact/" "" "$TOKEN")
MESSAGES_STATUS=$(get_field "$MESSAGES_RESPONSE" "__status__")

MESSAGE_FOUND=0
if [ -n "$CONTACT_ID" ] && [ "$MESSAGES_STATUS" = "200" ]; then
  MESSAGE_FOUND=$(echo "$MESSAGES_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
messages = data.get('__list__', data if isinstance(data, list) else [])
cid = $CONTACT_ID
found = any(str(m.get('id', '')) == str(cid) for m in messages)
print(1 if found else 0)
" 2>/dev/null || echo "0")
fi

if [ "$MESSAGES_STATUS" = "200" ] && [ "$MESSAGE_FOUND" = "1" ]; then
  pass "Step 8: Message appears in admin list (GET /api/contact)"
elif [ "$MESSAGES_STATUS" = "200" ] && [ -z "$CONTACT_ID" ]; then
  fail "Step 8: Cannot verify message in list (contact creation failed)"
else
  fail "Step 8: Message not found in admin list (status=$MESSAGES_STATUS, found=$MESSAGE_FOUND)"
fi

# -------------------------------------------------------------------
# Step 9: Delete the project (DELETE /api/projects/{id} with auth)
# -------------------------------------------------------------------
echo "Step 9: Delete the project"
if [ -n "$PROJECT_ID" ]; then
  DELETE_RESPONSE=$(json_request DELETE "$BASE_URL/api/projects/$PROJECT_ID" "" "$TOKEN")
  DELETE_STATUS=$(get_field "$DELETE_RESPONSE" "__status__")

  if [ "$DELETE_STATUS" = "204" ] || [ "$DELETE_STATUS" = "200" ]; then
    pass "Step 9: Delete the project (DELETE /api/projects/$PROJECT_ID)"
  else
    fail "Step 9: Project deletion failed (got status=$DELETE_STATUS)"
    echo "  Response: $DELETE_RESPONSE"
  fi

  # Cleanup: also delete the skill if created
  if [ -n "$SKILL_ID" ]; then
    json_request DELETE "$BASE_URL/api/skills/$SKILL_ID" "" "$TOKEN" > /dev/null 2>&1 || true
  fi
else
  fail "Step 9: Cannot delete project (project creation failed)"
fi

# -------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------
echo ""
echo "======================================"
echo "  E2E Test Results"
echo "======================================"
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo "======================================"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}All E2E tests passed!${NC}"
  exit 0
else
  echo -e "${RED}$FAIL test(s) failed.${NC}"
  exit 1
fi
