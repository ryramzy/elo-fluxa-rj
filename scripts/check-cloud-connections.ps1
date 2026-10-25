$ErrorActionPreference = 'Stop'

& gh repo view ryramzy/elo-fluxa-rj --json nameWithOwner --jq '.nameWithOwner'
if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI cannot access this repository. Run gh auth login.' }

& gcloud projects describe gen-lang-client-0976465403 --configuration=elo-fluxa-rj --format='value(projectId)'
if ($LASTEXITCODE -ne 0) { throw 'Google Cloud CLI cannot access the app project. See docs/CLOUD_CLI_SETUP.md.' }

& npx.cmd --yes vercel@65.2.0 project inspect elo-fluxa-rj --no-color
if ($LASTEXITCODE -ne 0) { throw 'Vercel CLI cannot access this project. Run npx vercel login.' }

Write-Output 'GitHub, Google Cloud, and Vercel project access verified. This does not certify application health.'
