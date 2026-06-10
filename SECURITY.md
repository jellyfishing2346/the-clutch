# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Clutch, **do not open a public GitHub issue.**

Report it privately by emailing the project maintainer directly. Include:

- A description of the vulnerability and its potential impact
- Steps to reproduce it
- Any relevant logs, screenshots, or proof-of-concept code

You can expect an acknowledgement within 72 hours and a status update within 7 days.

---

## Scope

The following are in scope for security reports:

- Authentication and session management flaws
- Row Level Security (RLS) bypass or data exposure
- Privilege escalation (e.g. a `new` trust level user accessing `trusted`-only tasks)
- Credits balance manipulation outside the intended flow
- SQL injection or other input validation issues

The following are **out of scope**:

- Vulnerabilities in third-party services (Supabase, Mapbox) — report those to the vendor directly
- Self-XSS or issues that require physical access to the victim's device
- Social engineering attacks

---

## Security Design Notes

For contributors reviewing security-relevant code:

- **RLS is the enforcement layer** — every table has Row Level Security enabled. Application-layer checks are supplementary, not the primary guard.
- **Credits are modified by triggers only** — no client can `INSERT` into `credits_transactions` directly; the RLS policy blocks it. Credits flow exclusively through server-side trigger logic.
- **Trust level is set by the database** — `profiles.trust_level` cannot be updated by the user's own session.
- **Session cookies are managed by `@supabase/ssr`** — never stored in `localStorage`.