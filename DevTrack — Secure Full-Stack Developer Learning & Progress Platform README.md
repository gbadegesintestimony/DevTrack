# DevTrack

> A secure full-stack platform for developers to track their learning goals, technologies, courses, projects, notes, and overall learning progress.

DevTrack is the first project in a progressive full-stack engineering roadmap.

The purpose of this project is not simply to build another CRUD application. DevTrack is designed to strengthen full-stack engineering fundamentals while establishing **security-conscious development practices from day one**.

---

## 1. Project Overview

DevTrack allows developers to manage and monitor their learning journey from a single platform.

A user can:

- Create an account
- Authenticate securely
- Manage their profile
- Add technologies they are learning
- Create learning goals
- Track progress
- Create courses/resources
- Record learning sessions
- Create notes
- Track completed learning activities
- View progress through a dashboard
- Search, filter, and paginate their data

The application will be built as a real full-stack application with a clear separation between:

```text
Frontend
    ↓
HTTP/API Layer
    ↓
Backend
    ↓
Business Logic
    ↓
Data Access
    ↓
Self-hosted PostgreSQL
```

---

# 2. Project Goals

### Primary Goals

1. Build a complete full-stack application.
2. Strengthen React and TypeScript skills.
3. Strengthen Node.js/Express backend development.
4. Practice PostgreSQL and relational database design.
5. Practice API design.
6. Learn secure authentication and authorization.
7. Learn proper server-side validation.
8. Practice secure session/cookie handling.
9. Implement CSRF protection correctly.
10. Learn frontend/backend integration.
11. Deploy a production-ready application.
12. Establish engineering practices that will carry into future projects.

---

# 3. Technology Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query

## Backend

- Node.js
- Express.js
- TypeScript

## Database

- PostgreSQL
- Self-hosted/local PostgreSQL installation
- Prisma ORM

> Supabase will NOT be used.

PostgreSQL will be installed and managed directly through the operating system/terminal during development.

Example:

```bash
psql
createdb devtrack
```

The exact database setup will depend on the development environment.

---

# 4. High-Level Architecture

```text
                    ┌─────────────────────┐
                    │       Browser       │
                    │ React + TypeScript  │
                    └──────────┬──────────┘
                               │
                         HTTPS / HTTP
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Express Server    │
                    │    API Gateway      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        Authentication    Authorization     Validation
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Business Logic    │
                    │      Services       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Prisma         │
                    │     Data Layer      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  PostgreSQL Server  │
                    │    Self Hosted      │
                    └─────────────────────┘
```

---

# 5. Core Features

## Authentication

Users can:

- Register
- Log in
- Log out
- Refresh/maintain authentication state
- Change password
- Request password reset
- Reset password
- View their authenticated session
- Revoke sessions where applicable

Authentication must be implemented securely on the server.

---

# 6. User Profile

Users can manage:

- Name
- Username
- Email
- Profile information
- Learning preferences

Sensitive account information must never be exposed unnecessarily through API responses.

---

# 7. Technologies

Users can track technologies they are learning.

Example:

```text
Go
React
TypeScript
PostgreSQL
Docker
AWS
```

Each technology can have:

- Name
- Description
- Current progress
- Status
- Start date
- Target completion date

---

# 8. Learning Goals

Users can create goals such as:

```text
Goal:
Learn React fundamentals

Technology:
React

Target:
Complete React fundamentals

Progress:
45%

Deadline:
2026-10-01
```

Goals can be:

- Created
- Updated
- Completed
- Archived
- Deleted

---

# 9. Courses & Learning Resources

Users can maintain learning resources.

Examples:

- Courses
- Documentation
- Books
- Tutorials
- Videos
- Articles

Each resource can contain:

- Title
- Description
- URL
- Type
- Technology
- Completion status
- Progress

External URLs must be validated server-side.

---

# 10. Learning Sessions

Users can record learning sessions.

Example:

```text
Date: August 18, 2026

Technology:
TypeScript

Duration:
90 minutes

What I learned:
Interfaces and generics

Notes:
...
```

The system can use this information to generate learning statistics.

---

# 11. Notes

Users can create private notes.

Notes belong to the authenticated user.

A user must NEVER be able to retrieve another user's notes by manipulating an ID.

For example:

```http
GET /api/notes/123
```

The server must verify:

```text
Does note 123 belong to the authenticated user?
```

before returning it.

---

# 12. Dashboard

The dashboard should provide useful information such as:

```text
Learning Progress

Go                  72%
React               51%
TypeScript          43%

Current Goals
------------------------
Learn React
Complete Go course
Build DevTrack

Learning Activity
------------------------
Monday       1h 20m
Tuesday      2h
Wednesday    45m
```

Possible metrics:

- Total technologies
- Active goals
- Completed goals
- Learning hours
- Current streak
- Course completion
- Progress by technology

---

# 13. Security Requirements

Security is a **core project requirement**.

Security must not be treated as a final phase.

Every feature must be implemented with security considerations from the beginning.

---

# 14. Authentication Security

Authentication will use secure server-managed authentication.

Recommended approach:

```text
Browser
   ↓
Secure HttpOnly Cookie
   ↓
Server
   ↓
Authenticated Session
```

Authentication cookies should use:

```text
HttpOnly
Secure
SameSite
```

appropriate to the deployment environment.

Authentication secrets must never be exposed to client-side JavaScript.

Passwords must never be stored as plaintext.

Passwords will be hashed using a modern password hashing algorithm such as:

```text
Argon2id
```

or another appropriately configured password hashing mechanism.

---

# 15. CSRF Protection

Because authentication may use cookies, CSRF protection is required for state-changing requests.

Protection will cover requests such as:

```text
POST
PUT
PATCH
DELETE
```

The backend will validate CSRF tokens before allowing protected state-changing operations.

Example:

```text
Browser
   │
   │ Request + CSRF token
   ▼
Express
   │
   ├── Authenticate request
   ├── Validate CSRF
   ├── Validate input
   ├── Authorize user
   └── Execute operation
```

CSRF protection must be enforced **server-side**.

The frontend may obtain/send the CSRF token, but the frontend must never be trusted to enforce security.

---

# 16. Authentication vs Authorization

Authentication answers:

> Who are you?

Authorization answers:

> Are you allowed to do this?

Both must be enforced server-side.

Example:

```text
User A
   ↓
Authenticated ✓
   ↓
Requests User B's note
   ↓
Authorization check ✗
   ↓
403 Forbidden
```

Never rely on frontend route protection as a security boundary.

---

# 17. IDOR Protection

DevTrack must protect against insecure direct object references.

This is dangerous:

```http
GET /api/goals/100
```

if the server simply returns goal `100`.

The server must verify ownership:

```text
Authenticated User
       ↓
Find Goal
       ↓
Does goal.userId === authenticatedUser.id?
       ↓
       ├── YES → return resource
       │
       └── NO  → reject request
```

This rule applies to every user-owned resource.

---

# 18. Server-Side Validation

The client cannot be trusted.

Even if React validates:

```text
email
password
title
URL
progress
```

the server must validate them again.

Example:

```text
Browser validation
        ↓
       API
        ↓
Server validation
        ↓
Business rules
        ↓
Database
```

We will use a validation library such as:

```text
Zod
```

or an equivalent TypeScript validation solution.

---

# 19. Input Validation

The API must validate:

- Data types
- Required fields
- String lengths
- Numeric ranges
- Enum values
- Dates
- URLs
- IDs
- Request bodies
- Query parameters
- Route parameters

For example:

```text
progress = 150
```

must be rejected because valid progress is:

```text
0–100
```

The database should also enforce appropriate constraints where possible.

---

# 20. SQL Injection Protection

Raw SQL must not be constructed using unsanitized user input.

Prisma parameterization should be used wherever possible.

Dangerous:

```text
"SELECT * FROM users WHERE email = '" + email + "'"
```

Safe approaches should use parameterized queries/ORM mechanisms.

Database access must always treat user input as untrusted.

---

# 21. XSS Protection

User-generated content must be treated as untrusted.

We must prevent malicious content from being executed in the browser.

Security considerations include:

- React's escaping behavior
- Avoiding unsafe HTML rendering
- Sanitizing HTML where rich text is introduced
- Content Security Policy
- Safe URL handling

We will not use dangerous HTML rendering unless there is a specific requirement and the content is properly sanitized.

---

# 22. CORS

CORS must be configured explicitly.

We will NOT use:

```text
Access-Control-Allow-Origin: *
```

for an authenticated production API.

The backend will only allow trusted frontend origins.

Example:

```text
Development:
http://localhost:5173

Production:
https://devtrack.example.com
```

The production origin will be configured through environment variables.

---

# 23. Rate Limiting

Sensitive endpoints must have stricter rate limits.

Especially:

```text
/register
/login
/password-reset
/forgot-password
```

Example:

```text
Normal API:
higher request allowance

Authentication:
strict request allowance
```

Rate limiting should be implemented server-side.

Redis may be introduced when appropriate.

---

# 24. Brute Force Protection

Authentication endpoints must protect against repeated login attempts.

Possible controls:

- Rate limiting
- Temporary throttling
- Account/session protections
- Generic authentication errors
- Monitoring suspicious activity

Do not reveal whether a specific account exists through password-reset or authentication error messages.

---

# 25. Password Security

Passwords must:

- Never be logged
- Never be returned through APIs
- Never be stored in plaintext
- Never be included in error messages
- Never be stored in frontend localStorage

Password hashes should use an appropriate password hashing algorithm.

---

# 26. Secrets Management

Secrets must never be committed to Git.

Never commit:

```text
.env
.env.production
database passwords
JWT secrets
session secrets
API keys
private keys
```

Repository should contain:

```text
.env.example
```

instead.

Example:

```env
DATABASE_URL=
SESSION_SECRET=
CSRF_SECRET=
NODE_ENV=
FRONTEND_URL=
```

Actual values remain outside version control.

---

# 27. Database Security

PostgreSQL will be self-hosted.

Development environment:

```text
Application
    ↓
PostgreSQL
```

Database credentials must be stored securely.

The application should use a dedicated database user rather than unnecessarily using a highly privileged PostgreSQL account.

Principle of least privilege applies.

Database access should not be exposed publicly unless absolutely required.

---

# 28. Database Constraints

Security and integrity should exist at multiple levels.

Application:

```text
Validate request
```

Business layer:

```text
Validate business rules
```

Database:

```text
Enforce constraints
```

Examples:

- Unique email
- Foreign keys
- Non-null fields
- Appropriate indexes
- Valid relationships

---

# 29. Secure Error Handling

Production APIs must not expose internal implementation details.

Bad:

```text
PrismaClientKnownRequestError:
Invalid `prisma.user.create()` invocation...
Database connection failed...
```

Instead:

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

Detailed errors should be logged securely on the server.

---

# 30. Logging Security

We will use structured logging.

Logs must never contain:

- Passwords
- Authentication tokens
- CSRF tokens
- Session secrets
- Database credentials
- Sensitive personal information

Sensitive fields must be redacted.

Example:

```text
{
  "event": "auth.login.success",
  "userId": "...",
  "requestId": "..."
}
```

Not:

```text
{
  "email": "...",
  "password": "...",
  "token": "..."
}
```

---

# 31. Security Headers

The backend should configure appropriate security headers.

Potential controls include:

- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Strict-Transport-Security in HTTPS production
- Frame protection
- Permissions Policy

A middleware such as Helmet may be used, with configuration reviewed rather than blindly accepting defaults.

---

# 32. HTTPS

Production traffic must use HTTPS.

Authentication cookies must use:

```text
Secure
```

in production.

HTTP should not be treated as an acceptable production transport for authenticated traffic.

---

# 33. Session Security

Sessions must be designed with:

- Secure cookies
- HttpOnly cookies
- Appropriate SameSite policy
- Session expiration
- Session invalidation
- Logout handling
- Rotation where appropriate

The browser should not be trusted to determine whether a session is valid.

The server decides.

---

# 34. Authorization Model

Initially DevTrack will primarily use user ownership.

Example:

```text
User
 ├── Goals
 ├── Technologies
 ├── Courses
 ├── Notes
 └── Learning Sessions
```

Every resource must be associated with its owner.

Future projects will introduce more advanced RBAC and organization-level authorization.

---

# 35. API Security

Every protected API endpoint should follow a pipeline similar to:

```text
Request
   ↓
Request ID
   ↓
Security Headers
   ↓
CORS
   ↓
Rate Limiting
   ↓
Authentication
   ↓
CSRF Validation
   ↓
Input Validation
   ↓
Authorization
   ↓
Business Logic
   ↓
Database
   ↓
Sanitized Response
```

Not every endpoint needs every middleware, but protected state-changing operations must have the appropriate controls.

---

# 36. API Design

Example API structure:

```text
/api/v1/auth
/api/v1/users
/api/v1/technologies
/api/v1/goals
/api/v1/resources
/api/v1/sessions
/api/v1/notes
/api/v1/dashboard
```

Versioning:

```text
/api/v1/...
```

allows future API evolution.

---

# 37. Example Authentication Endpoints

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

Sensitive authentication endpoints will have stricter security controls.

---

# 38. Example Goal Endpoints

```text
GET    /api/v1/goals
POST   /api/v1/goals
GET    /api/v1/goals/:id
PATCH  /api/v1/goals/:id
DELETE /api/v1/goals/:id
```

The backend must verify ownership for every resource operation.

---

# 39. Database Model

Initial conceptual model:

```text
User
 │
 ├──── Technology
 │
 ├──── Goal
 │
 ├──── LearningResource
 │
 ├──── LearningSession
 │
 └──── Note
```

Possible models:

```text
User
Technology
Goal
LearningResource
LearningSession
Note
Session
PasswordResetToken
```

The final schema will be designed before implementation.

---

# 40. Project Structure

Initial backend structure:

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── schemas/
│   ├── utils/
│   ├── lib/
│   ├── types/
│   ├── app.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

Frontend:

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   ├── routes/
│   └── main.tsx
├── public/
├── package.json
└── vite.config.ts
```

---

# 41. Testing Strategy

Testing will not be an afterthought.

We will have:

### Unit Tests

Test isolated business logic.

### Integration Tests

Test:

```text
API
 ↓
Service
 ↓
Database
```

### Security Tests

Test scenarios such as:

- Unauthorized request
- Expired authentication
- Invalid CSRF token
- Missing CSRF token
- Cross-user resource access
- Invalid input
- Rate limit behavior
- Malicious input
- Invalid IDs
- Privilege escalation attempts

### End-to-End Tests

Test important user flows:

```text
Register
 ↓
Login
 ↓
Create Goal
 ↓
Update Goal
 ↓
View Dashboard
 ↓
Logout
```

---

# 42. Definition of Done

A feature is NOT complete merely because it works.

A feature is complete when:

- Frontend implemented
- API implemented
- Server-side validation implemented
- Authorization implemented
- Database constraints considered
- Error handling implemented
- Tests written
- Security considerations addressed
- Logs implemented safely
- Documentation updated
- No secrets committed
- Code reviewed
- Production behavior considered

---

# 43. Development Principles

DevTrack follows these principles:

### Server is the authority

Never trust the frontend for:

- Authentication
- Authorization
- Permissions
- Validation
- Ownership
- Security decisions

### Least privilege

Every component should have only the permissions it needs.

### Defense in depth

Security should exist at multiple layers:

```text
Browser
   ↓
Network
   ↓
HTTP
   ↓
Authentication
   ↓
Authorization
   ↓
Validation
   ↓
Business Logic
   ↓
Database
```

### Fail securely

When something goes wrong, the system should fail closed rather than accidentally granting access.

### Secure by default

New endpoints should begin protected unless there is a deliberate reason for them to be public.

---

# 44. Development Environment

Required tools:

```text
Node.js
npm/pnpm
Git
PostgreSQL
psql
VS Code
```

Optional/introduced during development:

```text
Docker
Redis
```

PostgreSQL is locally/self-hosted and managed directly rather than through a managed backend platform.

---

# 45. Local PostgreSQL

The project will use a dedicated PostgreSQL database.

Example conceptual setup:

```text
PostgreSQL Server
       │
       └── devtrack database
```

We will create the database through the terminal and configure the application using:

```env
DATABASE_URL="..."
```

The exact credentials and connection string must never be committed.

---

# 46. Environment Separation

We will maintain separate configurations for:

```text
development
test
production
```

Production secrets must never be reused in development or testing.

---

# 47. Git & Repository Security

Before pushing code:

```text
git status
```

must be checked carefully.

The repository must include an appropriate:

```text
.gitignore
```

including:

```text
.env
.env.*
node_modules/
dist/
coverage/
```

while allowing:

```text
.env.example
```

---

# 48. Deployment

Initial deployment can use:

```text
Frontend:
Vercel or equivalent

Backend:
Render or equivalent

Database:
Self-managed PostgreSQL
```

However, the architecture must remain portable.

The application should not depend on Supabase-specific functionality.

Later projects will progressively move toward more infrastructure-oriented deployments.

---

# 49. Future Improvements

Potential future features:

- Learning streaks
- Public developer profiles
- Goal reminders
- Email notifications
- Calendar integration
- Achievement system
- Learning analytics
- Import/export
- API access
- Mobile client
- AI-assisted learning summaries

These are explicitly outside the initial MVP unless added later.

---

# 50. MVP Scope

The first version should contain only:

```text
Authentication
    ↓
User Profile
    ↓
Technologies
    ↓
Learning Goals
    ↓
Learning Resources
    ↓
Learning Sessions
    ↓
Notes
    ↓
Dashboard
```

Security is included from the first feature.

We will NOT build the entire roadmap before validating the core application.

---

# 51. Engineering Milestones

## Phase 1 — Foundation

- Repository setup
- Frontend setup
- Backend setup
- PostgreSQL setup
- Prisma setup
- Environment configuration
- Basic architecture
- Security middleware foundation

## Phase 2 — Authentication

- Registration
- Login
- Logout
- Session management
- Password hashing
- CSRF protection
- Rate limiting
- Authentication tests

## Phase 3 — Core Data

- Technologies
- Goals
- Resources
- Notes
- Learning sessions

## Phase 4 — Dashboard

- Progress calculations
- Statistics
- Charts
- Activity history

## Phase 5 — Security Hardening

- Authorization review
- IDOR testing
- Input validation review
- CSRF testing
- Rate-limit testing
- Security headers
- Error handling
- Logging/redaction review

## Phase 6 — Testing

- Unit tests
- Integration tests
- E2E tests
- Security tests

## Phase 7 — Deployment

- Production database
- Backend deployment
- Frontend deployment
- HTTPS
- Environment variables
- Production security configuration
- Health checks
- Logging

## Phase 8 — Final Hardening

Perform a deliberate security review before considering DevTrack production-ready.

---

# 52. Security Mindset

The most important rule for this project is:

> **The frontend is never a security boundary.**

Anything enforced only in React is considered a UX feature, not security.

For example:

```text
❌ Hide button from unauthorized user
```

is not authorization.

Instead:

```text
Frontend hides button
        +
Backend rejects unauthorized request
```

is correct.

The server must assume that an attacker can completely bypass the frontend and directly call the API.

---

# 53. Final Architecture Goal

DevTrack should ultimately look approximately like:

```text
                         INTERNET
                            │
                            ▼
                    ┌───────────────┐
                    │    Browser    │
                    │ React + TS    │
                    └───────┬───────┘
                            │
                       HTTPS/API
                            │
                            ▼
                 ┌────────────────────┐
                 │   Express Server   │
                 ├────────────────────┤
                 │ Security           │
                 │ Authentication     │
                 │ CSRF               │
                 │ Authorization      │
                 │ Validation         │
                 │ Rate Limiting      │
                 │ Error Handling     │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Business Services  │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │      Prisma        │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │   PostgreSQL       │
                 │   Self Hosted      │
                 └────────────────────┘
```

The objective is not merely:

> **"DevTrack works."**

The objective is:

> **"DevTrack works, is maintainable, is testable, is secure, and demonstrates that I understand how a real full-stack application should be engineered."**

---

## Project Rule

For every project that follows DevTrack, we will carry forward the same principle:

**Security is part of the architecture, not a feature added at the end.**

As the projects become more advanced, security will also become more advanced: RBAC, multi-tenancy isolation, secure file uploads, rate limiting, idempotency, concurrency controls, audit logging, secrets management, background-worker security, WebSocket authentication, infrastructure security, and eventually service-to-service security.