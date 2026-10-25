# Release safeguards

- Never push application changes directly to `main`. Use a `codex/` branch and a pull request.
- Preserve unrelated local changes and commits. Keep release work isolated.
- Before merging, require a clean install, production build, TypeScript check, security audit, functional tests, mobile UI tests, and contact regressions.
- Require the Vercel preview to build and pass deployed smoke tests for the exact PR commit. A local demo-mode test is not proof of working production authentication.
- Do not bypass required GitHub checks or branch protection. Report missing credentials or unavailable previews as release blockers.
- Verify the custom domain and key routes after deployment. Keep the previous working Vercel deployment available for rollback; do not delete it during release.
- Never claim tests guarantee zero outages. Separate application failures from DNS, network routing, provider outages, and account-specific flows needing a real test account.
