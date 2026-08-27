# Security Policy — ELO! English (eloingles.com.br)

## Supported Versions
We actively release patches and security enhancements for the production deployment of ELO!.

| Version / Branch | Supported          |
| ---------------- | ------------------ |
| `main` (Production) | :white_check_mark: |
| Older releases   | :x:                |

---

## Reporting a Vulnerability

We take the security of ELO! and our students' data very seriously. If you discover a security vulnerability, we appreciate your cooperation in disclosing it to us responsibly.

### How to Report
Please **DO NOT** create a public GitHub issue. Instead, submit security vulnerability reports privately via:

- **Email**: [mramsay0@gmail.com](mailto:mramsay0@gmail.com) with subject line `[SECURITY] ELO! Vulnerability Report`
- **Alternative**: [contato@eloingles.com.br](mailto:contato@eloingles.com.br)

### What to Include in Your Report
To help us triage and validate your report quickly, please include:
1. **Description**: Clear summary of the issue and potential security impact.
2. **Steps to Reproduce**: Detailed reproduction steps, sample payload, or minimal proof-of-concept (PoC).
3. **Affected Components**: Affected URLs, endpoints, or Firestore collections.
4. **Remediation Suggestions**: Any proposed fixes or mitigations (optional).

### Our Commitment
- We will acknowledge receipt of your vulnerability report within **48 hours**.
- We will provide an estimated timeline for remediation.
- We will notify you once the vulnerability has been resolved and deployed to production.
- We respect Coordinated Vulnerability Disclosure (CVD) and ask for a 30-day window before any public discussion.

---

## Security & Compliance Architecture

ELO! implements multi-layered security controls:
- **Transport Security**: Enforced HTTPS with HSTS (`max-age=63072000; includeSubDomains; preload`).
- **Data Protection**: Zero plaintext storage of passwords (delegated to Firebase Authentication with bcrypt/scrypt).
- **Access Control**: Role-based access control (RBAC) enforced through server-side Firebase Security Rules and Google Cloud IAM.
- **Privacy Compliance**: LGPD (Lei Geral de Proteção de Dados - Brasil) and GDPR compliance with 1-click account deletion and data export.
- **Automated Defenses**: GitHub Dependabot dependency auditing and CodeQL static security analysis.
