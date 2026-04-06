#!/usr/bin/env bash
# ---------------------------------------------------------------
# setup-secrets.sh
# Reads .env.local and syncs each VITE_* variable into
# GCP Secret Manager. Idempotent — safe to run repeatedly.
#
# Usage:
#   chmod +x setup-secrets.sh
#   ./setup-secrets.sh                  # uses current gcloud project
#   ./setup-secrets.sh my-gcp-project   # explicit project
# ---------------------------------------------------------------
set -euo pipefail

# ---- Configuration ----
ENV_FILE="${ENV_FILE:-.env.local}"
PROJECT_ID="${1:-$(gcloud config get-value project 2>/dev/null)}"

if [[ -z "$PROJECT_ID" ]]; then
  echo "❌  No project ID. Pass it as arg or set via: gcloud config set project <id>"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌  $ENV_FILE not found. Create it or set ENV_FILE=<path>."
  exit 1
fi

# Cloud Build service account: <project-number>@cloudbuild.gserviceaccount.com
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

echo "📦  Project:       $PROJECT_ID"
echo "🔑  Cloud Build SA: $CLOUD_BUILD_SA"
echo "📄  Env file:       $ENV_FILE"
echo ""

# ---- Process each VITE_* line ----
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip blank lines and comments
  [[ -z "$line" || "$line" == \#* ]] && continue

  # Extract KEY=VALUE (strip surrounding quotes from value)
  KEY="${line%%=*}"
  VALUE="${line#*=}"
  VALUE="${VALUE%\"}"
  VALUE="${VALUE#\"}"

  # Only process VITE_* variables
  [[ "$KEY" != VITE_* ]] && continue

  echo "🔧  Processing secret: $KEY"

  # Create secret if it doesn't exist (ignore "already exists" error)
  if ! gcloud secrets describe "$KEY" --project="$PROJECT_ID" &>/dev/null; then
    echo "   ➕ Creating secret $KEY ..."
    gcloud secrets create "$KEY" \
      --project="$PROJECT_ID" \
      --replication-policy="automatic"
  else
    echo "   ✅ Secret $KEY already exists."
  fi

  # Add (or overwrite) the latest version
  echo "   📝 Setting secret value ..."
  printf '%s' "$VALUE" | gcloud secrets versions add "$KEY" \
    --project="$PROJECT_ID" \
    --data-file=-

  # Grant Cloud Build SA access (idempotent — won't duplicate bindings)
  echo "   🔐 Granting secretAccessor to Cloud Build SA ..."
  gcloud secrets add-iam-policy-binding "$KEY" \
    --project="$PROJECT_ID" \
    --member="serviceAccount:${CLOUD_BUILD_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None \
    --quiet

  echo ""
done < "$ENV_FILE"

echo "✅  All VITE_* secrets synced to Secret Manager for project $PROJECT_ID."
echo ""
echo "Next steps:"
echo "  1. Commit Dockerfile + cloudbuild.yaml (secrets are NOT in these files)"
echo "  2. Push to trigger Cloud Build"
echo "  3. (Optional) Rotate secrets: re-run this script after updating .env.local"
