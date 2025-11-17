#!/usr/bin/env bash
set -euo pipefail
# E2E sign-in test using curl and a cookie jar
BASE=${NEXTAUTH_URL:-http://localhost:3000}
JAR=/tmp/e2e_cookies_$$.jar
CRED=./scripts/sample-credentials.txt
EMAIL="alice@example.com"
PASSWORD="TestPass123!"
if [ -f "$CRED" ]; then
  # first line expected: email: ... password: ...
  first=$(head -n1 "$CRED")
  if [[ $first =~ email:[[:space:]]*([^[:space:]]+)[[:space:]]+password:[[:space:]]*([^[:space:]]+) ]]; then
    EMAIL=${BASH_REMATCH[1]}
    PASSWORD=${BASH_REMATCH[2]}
  fi
fi
echo "E2E: testing against $BASE"
# 1) get csrf
csrf_json=$(curl -s -c "$JAR" -H "Accept: application/json" "$BASE/api/auth/csrf/")
csrf_token=$(echo "$csrf_json" | sed -n 's/.*"csrfToken"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' || true)
if [ -z "$csrf_token" ]; then
  echo "Failed to get csrf token: $csrf_json"
  exit 2
fi
echo "Got csrf token: ${csrf_token:0:8}..."
# 2) sign in (follow redirects, preserve cookies)
res=$(curl -s -w "\n%{http_code}" -c "$JAR" -b "$JAR" -L -X POST "$BASE/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "csrfToken=$csrf_token" \
  --data-urlencode "callbackUrl=$BASE/" \
  --data-urlencode "email=$EMAIL" \
  --data-urlencode "password=$PASSWORD")
body=$(echo "$res" | sed '$d')
code=$(echo "$res" | tail -n1)
echo "Signin HTTP code: $code"
# 3) call /api/clients with cookie jar
clients_res=$(curl -s -w "\n%{http_code}" -b "$JAR" "$BASE/api/clients/")
clients_body=$(echo "$clients_res" | sed '$d')
clients_code=$(echo "$clients_res" | tail -n1)
echo "/api/clients HTTP code: $clients_code"
echo "/api/clients body:\n$clients_body"

# 4) create a new client
echo "Creating a new client..."
create_res=$(curl -s -w "\n%{http_code}" -b "$JAR" -X POST "$BASE/api/clients/" \
  -H "Content-Type: application/json" \
  -d '{"name":"E2E Created Client","email":"e2e.client@example.com","phone":"(555) 111-2222"}')
create_body=$(echo "$create_res" | sed '$d')
create_code=$(echo "$create_res" | tail -n1)
echo "Create HTTP code: $create_code"
echo "Create body: $create_body"

new_id=$(echo "$create_body" | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' || true)
if [ -z "$new_id" ]; then
  # try parsing MongoDB _id field inside returned client object
  new_id=$(echo "$create_body" | sed -n 's/.*"_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' || true)
fi
if [ -z "$new_id" ]; then
  echo "Failed to parse new client id from create response"
else
  echo "New client id: $new_id"

  # 5) update the client
  echo "Updating client name..."
  upd_res=$(curl -s -L -w "\n%{http_code}" -b "$JAR" -X PUT "$BASE/api/clients/$new_id/" \
    -H "Content-Type: application/json" -d '{"name":"E2E Updated Client"}')
  upd_body=$(echo "$upd_res" | sed '$d')
  upd_code=$(echo "$upd_res" | tail -n1)
  echo "Update HTTP code: $upd_code"
  echo "Update body: $upd_body"

  # 6) delete the client
  echo "Deleting the client..."
  del_res=$(curl -s -L -w "\n%{http_code}" -b "$JAR" -X DELETE "$BASE/api/clients/$new_id/")
  del_body=$(echo "$del_res" | sed '$d')
  del_code=$(echo "$del_res" | tail -n1)
  echo "Delete HTTP code: $del_code"
  echo "Delete body: $del_body"
fi
# cleanup
rm -f "$JAR"
exit 0
