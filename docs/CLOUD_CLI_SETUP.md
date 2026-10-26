# Cloud CLI connections

On Windows, run `npm run cloud:check` to verify authenticated access to this repository, its GCP project, and its Vercel project. It prints identifiers and project metadata, never tokens or environment-secret values.

| Tool | Project scope |
| --- | --- |
| GitHub CLI (`gh`) | `ryramzy/elo-fluxa-rj` |
| Vercel CLI | `matthew-ramsay-s-projects/elo-fluxa-rj` (`prj_AbgsDKuPQDQpEfh6GKBNvg75lkbT`) |
| Google Cloud CLI (`gcloud`) | `gen-lang-client-0976465403`, display name `elo-fluxa-rj` |

The app's GCP ID was verified against the Firebase project identifier in Vercel's Preview environment. `.firebaserc` uses that ID rather than the display name.

## Google Cloud commands

This machine has a named configuration `elo-fluxa-rj` for the app. The user's existing default configuration remains unchanged. Use the repo wrapper:

```powershell
.\scripts\gcloud.ps1 services list --enabled
.\scripts\gcloud.ps1 firestore databases list
```

For another machine, create the configuration after `gcloud auth login`:

```powershell
gcloud config configurations create elo-fluxa-rj --no-activate
gcloud config set account YOUR_GOOGLE_ACCOUNT --configuration=elo-fluxa-rj
gcloud config set project gen-lang-client-0976465403 --configuration=elo-fluxa-rj
```

Explicit configuration selection prevents commands from accidentally targeting another app. Authentication to the CLI does not create a service-account JSON key for Vercel.

## Other CLI commands

```powershell
gh auth status
gh pr checks 20 --repo ryramzy/elo-fluxa-rj
npx --yes vercel@65.2.0 whoami
npx --yes vercel@65.2.0 project inspect elo-fluxa-rj
```

The supported Vercel automation bypass is configured as the GitHub Actions secret `VERCEL_AUTOMATION_BYPASS_SECRET`. Do not print or commit it, and do not disable preview protection to make tests pass.

## Verified readiness gaps on October 25, 2026

- The active Firebase project returns an empty Firestore database list; describing `(default)` returns `NOT_FOUND`. Confirm whether to create the database or use another project before provisioning anything. A database's location must be deliberately chosen.
- Billing is disabled. Secret Manager access fails with `BILLING_DISABLED`; this is a resource prerequisite, not a CLI login failure. No billing settings were changed.
- Vercel still has no `GOOGLE_SERVICE_ACCOUNT_KEY` entry, and deployed server health returns HTTP 500. A successful Vercel build does not mean the server credential is configured.
- Provisioning a database also requires reviewing and validating its access rules and indexes. Do not treat CLI access alone as release approval.
