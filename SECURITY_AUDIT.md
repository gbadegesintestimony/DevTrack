# DevTrack — Security Architecture & Threat Model Audit Report

> **Core Engineering Tenet**:  
> *"The frontend is never a security boundary. All authentication, authorization, IDOR isolation, and input validation are strictly enforced on the server."*

This document provides a comprehensive security audit of **DevTrack**, detailing the defense-in-depth mechanisms implemented across the entire full-stack architecture.

---

## 🛡️ 1. Security Architecture & Threat Matrix

| Threat Category | Potential Risk / Attack Vector | DevTrack Mitigation & Architectural Defense | Implementation Reference |
| :--- | :--- | :--- | :--- |
| **Insecure Direct Object Reference (IDOR)** | Attacker alters resource ID in URL to view or manipulate other users' goals, notes, or sessions. | **Strict Composite Lookups**: Every query across all 5 domain models enforces `where: { id, userId: req.user.id }`. Returns uniform `404 NOT_FOUND` to prevent ID enumeration. | [technology.service.ts](file:///c:/Users/testy/DevTrack/backend/src/services/technology.service.ts), [note.service.ts](file:///c:/Users/testy/DevTrack/backend/src/services/note.service.ts) |
| **Cross-Site Request Forgery (CSRF)** | Malicious third-party website tricks authenticated browser into executing state-changing API actions. | **Double-Submit Cookie Pattern**: Server verifies `devtrack_csrf` cookie matches `x-csrf-token` header on all mutating methods (`POST`, `PUT`, `PATCH`, `DELETE`). | [csrf.ts](file:///c:/Users/testy/DevTrack/backend/src/middleware/csrf.ts) |
| **Credential Stuffing & Brute Force** | Automated dictionary attacks against login and password reset endpoints. | **Rate Limiting (Token Bucket)**: Strict IP-based limits (15 attempts / 15 mins) on `/register`, `/login`, `/forgot-password`. Global API limit (200 req / min). | [rateLimiter.ts](file:///c:/Users/testy/DevTrack/backend/src/middleware/rateLimiter.ts) |
| **Password Database Breach** | Leaked database hashes exposed to rainbow table and GPU cracking. | **Bcrypt Adaptive Hashing**: Cost factor 12 with cryptographically random per-password salts. Slows dictionary attacks exponentially. | [crypto.ts](file:///c:/Users/testy/DevTrack/backend/src/lib/crypto.ts) |
| **Session Hijacking & XSS Theft** | Malicious scripts read session tokens from `localStorage` or `document.cookie`. | **HttpOnly & Secure Cookies**: Raw session tokens stored in `HttpOnly` cookies inaccessible to JavaScript. Database stores only SHA-256 token hashes (`tokenHash`). | [session.ts](file:///c:/Users/testy/DevTrack/backend/src/lib/session.ts) |
| **Stored XSS via URLs / Notes** | Attacker injects `javascript:alert(1)` or malicious protocols into bookmarks. | **Strict URL Protocol Validation**: Custom Zod schema parses protocol and rejects anything not starting with `http:` or `https:`. | [resource.schema.ts](file:///c:/Users/testy/DevTrack/backend/src/schemas/resource.schema.ts) |
| **Clickjacking & MIME Sniffing** | Malicious sites embed DevTrack in an `<iframe>` or sniff content types. | **Helmet Security Headers**: Enforces `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and strict `Content-Security-Policy`. | [securityHeaders.ts](file:///c:/Users/testy/DevTrack/backend/src/middleware/securityHeaders.ts) |
| **Information Disclosure via Logs** | Passwords, tokens, or session cookies logged to plaintext stdout/files. | **Automated Pino Log Redaction**: Explicit redaction paths mask `password`, `token`, `authorization`, `cookie`, `csrfToken` as `[REDACTED]`. | [logger.ts](file:///c:/Users/testy/DevTrack/backend/src/lib/logger.ts) |
| **Information Disclosure via Errors** | Database internal errors or stack traces leaked to client in production. | **Centralized Safe Error Handler**: Strips stack traces and internal Prisma exceptions, returning uniform `{ success: false, error: { code, message } }`. | [errorHandler.ts](file:///c:/Users/testy/DevTrack/backend/src/middleware/errorHandler.ts) |
| **Cross-Origin Cookie Exploitation** | Cross-domain cookies accepted from unauthorized origins. | **Dynamic CORS Origin Lock**: Rejects unapproved origins while allowing whitelisted production domains with `credentials: true`. | [cors.ts](file:///c:/Users/testy/DevTrack/backend/src/middleware/cors.ts) |

---

## 🔑 2. Cryptographic & Token Design

### Session Token Architecture
```text
Client Browser                         Database (Prisma)
┌─────────────────────────┐            ┌─────────────────────────┐
│ HttpOnly Session Cookie │            │      Session Table      │
│   (Raw 64-char Hex)     │            │  (SHA-256 tokenHash)    │
│  devtrack_session=...   │            │   userId, expiresAt     │
└────────────┬────────────┘            └────────────▲────────────┘
             │                                      │
             │   1. Sends raw token on request      │
             └──────────────────────────────────────┤
                 2. Server hashes: SHA-256(raw)    │
                 3. Compares with tokenHash ────────┘
```
- **Database Compromise Safety**: Even if the database is read by an unauthorized party, raw session tokens cannot be recovered because only irreversible SHA-256 hashes are stored.

---

## 🧪 3. Automated Security Test Verification

The master test suite executes **38 automated assertions** verifying all security layers:

```bash
npm test
```

### Verified Test Categories:
1. **Anti-IDOR Isolation**: Verified that User A querying User B's resource ID returns `null`/`404 Not Found`.
2. **CSRF Double-Submit**: Verified that mutating requests without matching `x-csrf-token` return `403 Forbidden`.
3. **Malicious URL Schemes**: Verified that `javascript:`, `data:`, `vbscript:`, `file:` URLs are rejected by Zod schemas.
4. **Password Policy**: Verified that weak, low-entropy passwords (< 8 chars, missing uppercase, missing numbers) are rejected.
5. **Bcrypt Salt Uniqueness**: Verified that identical passwords generate unique, non-colliding salts and hashes.
6. **Log Redaction**: Verified that sensitive credentials and headers are scrubbed from output streams.

---

## 📋 4. Production Readiness Checklist

- [x] Strict composite user scoping on all Prisma queries.
- [x] Zero stack trace disclosure in production error responses.
- [x] Multi-tenant isolation verified with automated tests.
- [x] Production session cookies configured with `HttpOnly`, `SameSite: none`, `Secure: true`.
- [x] Helmet security headers active (`nosniff`, `DENY`, `strict-origin-when-cross-origin`).
- [x] Automated rate limiting protecting auth endpoints.
- [x] Double-Submit CSRF active on all mutating verbs.
- [x] Live observability `/api/v1/health` with PostgreSQL latency check.
- [x] Multi-stage Docker containers running as non-root user (`devtrack`).
