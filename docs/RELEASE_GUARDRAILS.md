# Release checks

Application changes must reach `main` through a pull request. Main is protected with required checks, up-to-date branches, administrator enforcement, and no force pushes or branch deletion.

## Before merging

1. `npm ci`, `npm run build`, `npm run typecheck`, and `npm audit --audit-level=moderate` must pass.
2. Functional, mobile UI, and WhatsApp regression tests must pass against the production build.
3. Vercel must deploy the exact PR head commit. `Verify Vercel Preview` waits for that deployment and tests the deployed routes and `/api/health`. It rejects missing Firebase configuration or demo mode.
4. Check account-specific login, booking, and payment flows with a designated test account. Public route tests do not prove those flows work.
5. Record the current working Vercel deployment before release. An expired deployment URL cannot serve as a rollback target.

The required GitHub checks are `Verify Build & Contact Links`, `Verify Vercel Preview`, and `Vercel`. Do not bypass them. A missing or protected preview blocks the release until Vercel access is configured.

## After merging

Use `gh pr checks`, `vercel list`, and `vercel inspect <deployment-url>` to confirm the expected commit deployed. Run:

```powershell
$env:BASE_URL='https://www.eloingles.com.br'
$env:REQUIRE_FIREBASE='true'
npx playwright test tests/release-smoke.spec.ts --reporter=list
```

Also check the bare domain redirect, mobile browser, WhatsApp contact destination, and authenticated test-account flows. If a release fails, stop further releases and use `vercel rollback <previous-working-deployment-url>` after verifying the target. Do not delete the last working deployment.

## October 25 desktop connectivity finding

From the tested desktop network, `216.198.79.1` and `216.198.79.65` time out, while `64.29.17.1`, `64.29.17.65`, and the legacy Vercel edge `76.76.21.21` serve the same custom hostname successfully. Normal DNS can select an unreachable address. Flushing Windows DNS did not resolve the failure. This indicates a network-route or filtering problem for part of Vercel's address space; it is not a React startup failure. The precise ISP/router/Vercel cause is not yet established.

The stable project URL `https://elo-fluxa-rj.vercel.app` returned HTTP 200. Do not publish a DNS or hosts-file override as a permanent fix without verifying the domain configuration in Vercel and the affected network route.

## Local validation limits

The local Firebase environment values are empty, so local route tests use demo mode. Automatic WhatsApp reminder credentials are also absent locally. Deployment smoke tests deliberately require real Firebase configuration and the server auth gateway. Prefilled WhatsApp messages open a chat; they do not send a message without the visitor's action.
