#!/bin/bash
# RASI App — Vercel environment setup
# Spusť: bash setup-vercel.sh

VERCEL_TOKEN="${VERCEL_TOKEN:-VLOZ_TOKEN_SEM}"
API="https://api.vercel.com"

echo "=== RASI App — Vercel setup ==="
echo ""

# 1. Získej seznam projektů
echo "Načítám projekty..."
PROJECTS=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" "$API/v9/projects")
echo "$PROJECTS" | python3 -c "
import sys, json
d = json.loads(sys.stdin.read())
projects = d.get('projects', [])
if not projects:
    print('Žádné projekty nenalezeny.')
else:
    print('Dostupné projekty:')
    for i, p in enumerate(projects):
        print(f'  [{i}] {p[\"name\"]} (id: {p[\"id\"]})')
"

echo ""
echo "Zadej ID projektu (z výpisu výše):"
read PROJECT_ID

echo ""
echo "--- Zadej hodnoty proměnných ---"
echo "(stiskni Enter pro přeskočení)"
echo ""

read_var() {
  local name=$1
  local hint=$2
  echo -n "$name [$hint]: "
  read val
  echo "$val"
}

DATABASE_URL=$(read_var "DATABASE_URL" "Supabase → Settings → Database → URI")
SUPABASE_URL=$(read_var "NEXT_PUBLIC_SUPABASE_URL" "https://xxxx.supabase.co")
SUPABASE_ANON=$(read_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase → Settings → API → anon key")
SUPABASE_SERVICE=$(read_var "SUPABASE_SERVICE_ROLE_KEY" "Supabase → Settings → API → service_role key")
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET: vygenerováno automaticky → $NEXTAUTH_SECRET"
read_var "NEXTAUTH_URL" "https://tvoje-domena.vercel.app" > /dev/null
NEXTAUTH_URL=$(read_var "NEXTAUTH_URL" "https://tvoje-domena.vercel.app")
APP_URL=$NEXTAUTH_URL
RESEND_KEY=$(read_var "RESEND_API_KEY" "resend.com → API Keys")
SENTRY_DSN=$(read_var "SENTRY_DSN" "sentry.io → Project → DSN (nebo nechej prázdné)")

set_env() {
  local key=$1
  local value=$2
  local target=$3  # production, preview, development
  if [ -z "$value" ]; then return; fi
  echo "Nastavuji $key ($target)..."
  curl -s -X POST "$API/v10/projects/$PROJECT_ID/env" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"$key\",\"value\":\"$value\",\"type\":\"encrypted\",\"target\":[\"$target\"]}" \
    | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print('  OK' if 'id' in d else f'  CHYBA: {d}')"
}

echo ""
echo "=== Nastavuji proměnné na Vercel ==="

for TARGET in production preview development; do
  set_env "DATABASE_URL" "$DATABASE_URL" "$TARGET"
  set_env "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "$TARGET"
  set_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON" "$TARGET"
  set_env "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE" "$TARGET"
  set_env "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "$TARGET"
  set_env "NEXTAUTH_URL" "$NEXTAUTH_URL" "$TARGET"
  set_env "NEXT_PUBLIC_APP_URL" "$APP_URL" "$TARGET"
  set_env "RESEND_API_KEY" "$RESEND_KEY" "$TARGET"
  set_env "SENTRY_DSN" "$SENTRY_DSN" "$TARGET"
done

echo ""
echo "=== Hotovo! ==="
echo "Zkontroluj nastavení na: https://vercel.com"
