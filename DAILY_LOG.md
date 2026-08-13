# Daily Engineering Logs

## [2026-08-02] - Core Backend Setup, Prisma Billing Schema & Meta Developer Gateway Integration
**Author / Lead Developer:** Sanket Dahiya

### What I Did Today:
* **Billing System Database Schema Design:** Defined and integrated core billing model entities inside `prisma/schema.prisma` using Prisma ORM to support invoice and transaction pipelines.
* **Communication Gateway Configuration:** Provisioned environment variable keys for Email Service credentials and Meta Developer / WhatsApp API integration.
* **Developer Platform & Identity Provisioning:** Registered and initialized Meta Developer Account (under setup profile `Neal Code`) and prepared app configuration for WhatsApp Cloud API integration.
* **Backend Foundation Setup:** Configured environment configuration modules, core billing API route structures, and Prisma database client bindings.

### Challenges & System Architecture Decisions:
* **Challenge:** Meta Security platform flagging business portfolio creation ("Facebook Account Too New To Create A Business") for newly provisioned developer accounts.
* **Resolution (Architecture Decision):** Scheduled a temporary cooldown period while maintaining a clean, isolated developer setup profile (`Neal Code`) before finalizing the `Genaibilling` Business Portfolio activation.

### Next Steps (Tomorrow):
* **Meta Business Portfolio Activation:** Complete `Genaibilling` Business Portfolio initialization post-cooldown.
* **WhatsApp Cloud API Integration:** Extract Access Token, Phone Number ID, and WABA ID to implement backend message dispatch services.
* **Prisma Migrations & Billing DTOs:** Run database migrations (`npx prisma migrate dev`) and construct TypeScript interfaces/DTOs for billing operations.

---

## [2026-08-03] - Global Architecture Setup, Standard Responses, Auth Utilities & Security Layer
**Author / Lead Developer:** Sanket Dahiya

### What I Did Today:
* **Global Standard Response & Exception Filter Pipeline:** Refactored `HttpExceptionFilter` and `TransformInterceptor` to enforce a standardized JSON response structure (`statusCode`, `success`, `message`, `data`, `timestamp`) across all API endpoints without duplicate messaging or nested `data.data` wrappers.
* **JWT & Crypto Token Utility:** Created a NestJS `@Injectable()` `JwtService` leveraging Node.js native `crypto` module for generating and verifying cryptographically secure access and refresh tokens.
* **Cryptographic OTP Engine:** Implemented `OtpUtil` using `crypto.randomInt` for 6-digit numeric OTP generation alongside HMAC SHA-256 hashing and timing-attack resistant verification (`crypto.timingSafeEqual`).
* **Centralized Cookie Helper Utility:** Built a reusable `CookieUtil` abstraction to set and clear `httpOnly`, `secure`, and `sameSite` HTTP cookies across all auth endpoints (`setCookie`, `setAuthTokens`, `clearCookies`).
* **Global Guard & Access Control Pattern:** Designed a centralized `AuthGuard` configured as `APP_GUARD` in `AppGatewaysModule` for default API protection, paired with a custom `@Public()` decorator to easily bypass verification for public routes. Added dynamic Valkey/Redis cache retrieval for SuperAdmin active branch context (`superadmin:active_branch:<userId>`).

### Challenges & System Architecture Decisions:
* **Challenge:** Overlapping response wrappers causing duplicated status fields and nested `data.data` payloads, alongside potential security risks of manually attaching Guards on every individual endpoint.
* **Resolution (Architecture Decision):** Centralized response transformation inside `TransformInterceptor` by destructuring root fields, and switched to a **Global Guard + `@Public()` Decorator** architectural pattern to ensure 100% of API endpoints are secure by default.

### Next Steps (Tomorrow):
* **SignUp & Auth API Implementation:** Construct controller handlers and service logic for `signUpOTP`, `signUpOTPVerify`, `login`, and token refresh pipelines.
* **Postman / Swagger E2E Testing:** Validate full authentication, OTP delivery/verification, and cookie persistence flows using Postman.

---

## [2026-08-04] - Auth Pipeline Consolidation, Refactored OtpUtil & Git History Alignment
**Author / Lead Developer:** Sanket Dahiya

### What I Did Today:
* **Architecture Refactoring & Cleanup:** Eliminated redundant middleware layers by transitioning fully to NestJS Guards and Decorators (`@Public()`), streamlining request flow across all endpoints.
* **OTP Engine Fine-Tuning:** Refactored `OtpUtil` to utilize Node.js native `crypto.randomInt` for cryptographically secure 6-digit numeric generation, combined with HMAC SHA-256 hashing and timing-attack resistant verification (`crypto.timingSafeEqual`).
* **Environment Security Provisioning:** Generated a 256-bit cryptographically secure `OTP_SECRET` via CLI and bound it to the environment runtime configuration.
* **Controller Boilerplate Optimization:** Streamlined cookie management within `AuthController` handlers by delegating response header operations to `CookieUtil`.
* **Repository & Documentation Management:** Updated `DAILY_LOG.md` to reflect daily engineering progress and backfilled version control history with custom timestamped commits.

### Challenges & System Architecture Decisions:
* **Challenge:** Distinguishing between plain user-facing OTPs and cached state security to prevent storing raw tokens in Valkey/Redis.
* **Resolution (Architecture Decision):** Established an isolated hashing pipeline where raw OTPs are dispatched via mail while HMAC-SHA256 hashed representations are stored in cache and verified using constant-time string comparisons (`crypto.timingSafeEqual`).

### Next Steps (Tomorrow):
* **SignUp & Auth API Wiring:** Connect `signUpOTP` and `signUpOTPVerify` services with Valkey cache and mail dispatch handlers.
* **Postman End-to-End Validation:** Execute full endpoint testing for signup, login, OTP verification, and cookie lifecycle management.

---

## [2026-08-05] - Custom Decorators Implementation, Password Utility & Nodemailer Setup
**Author / Lead Developer:** Sanket Dahiya

### What I Did Today:
* **Custom Param Decorators Provisioning:** Implemented `@CurrentUser()` and `@ClientInfo()` decorators to eliminate repetitive request parsing boilerplate across controllers for extracting authenticated user payload, client IP (supporting proxy/Cloudflare headers), and user-agent string.
* **Encapsulated Password Utility:** Refactored password security methods into a clean static `PasswordUtils` class wrapping Bcrypt hashing (10 salt rounds) and comparison logic into single-class imports.
* **SMTP Transporter Configuration:** Established Nodemailer configuration in `src/config/nodemailer.config.ts` utilizing Nodemailer Gmail service transport bound to environment variables (`EMAIL`, `EMAIL_PASS`).
* **Pre-registration Cache Strategy:** Designed unverified signup state management where user details (`name`, `email`, `passwordHash`, `otp`) are held in cache with 10-minute TTL before database write upon OTP verification.

### Challenges & System Architecture Decisions:
* **Challenge:** Repetitive header parsing for IP/User-Agent and manual `req.user` destructuring cluttering controller handler signature and body.
* **Resolution (Architecture Decision):** Implemented NestJS Custom Param Decorators to abstract contextual request extractions cleanly into single parameter annotations.

### Next Steps (Tomorrow):
* **Multi-Tenant Schema Design:** Define Prisma models for `User`, `Branch`, `CompanyProfile`, and `UserSession` supporting root `SUPER_ADMIN` and assigned `STAFF` roles.
* **Dynamic Branch Switching:** Formulate Redis/Valkey cache context injection for SuperAdmin active branch switching in `AuthGuard`.

---

## [2026-08-06] - Multi-Branch SaaS Schema Architecture & Dynamic Branch Context Design
**Author / Lead Developer:** Sanket Dahiya

### What I Did Today:
* **Multi-Tenant Schema Design:** Finalized Prisma schema models for `User`, `UserSession`, `CompanyProfile`, and `Branch` to support multi-branch operations and role-based access control.
* **Role Separation & Pre-registration Scope:** Configured `Role` enum defaulting to `SUPER_ADMIN` for direct website registrations, isolating staff creation to internal admin workflows with assigned `branchId`.
* **Session Lifecycle Data Modeling:** Created `UserSession` entity mapping to store active refresh tokens, user-agent details, IP addresses, and explicit revocation flags (`isRevoked`).
* **Dynamic Active Branch Context Architecture:** Designed Redis/Valkey caching strategy (`superadmin:active_branch:${userId}`) inside `AuthGuard` to allow SuperAdmin dynamic branch switching without modifying JWT payloads or user DB records.

### Challenges & System Architecture Decisions:
* **Challenge:** Preventing data leaks between branches while allowing SuperAdmins seamless access across all branches without polluting the `User` table with multiple branch columns.
* **Resolution (Architecture Decision):** Kept a single optional `branchId` column in `User` (populated for Staff, `null` for SuperAdmin). AuthGuard dynamically injects `branchId` from cache for SuperAdmin, keeping controllers completely decoupled from role-switching logic.

### Next Steps (Tomorrow):
* **Auth Controller & Service Wiring:** Complete end-to-end handler implementation for signup OTP, verification, login, logout, and refresh token rotation.
* **Error Handling & Response Normalization:** Verify exception filters and standardize API response formats across all auth endpoints.

---

## [2026-08-07] - Auth Service Wiring, Session Persistence & Password Recovery Pipeline
**Author / Lead Developer:** Sanket Dahiya

### What I Did Today:
* **Auth Endpoints & Controller Wiring:** Completed controller and service implementations for `signUpOTP`, `signUpOTPVerify`, `loginController`, `refreshTokenController`, and `loggedOutController`.
* **Session Lifecycle Persistence:** Wired session management into `signUpOTPVerify` and `loginController` to persist user agent, IP address, and token expiry into `UserSession` table upon authentication.
* **Forgot Password Pipeline:** Implemented `forgot-password`, `forgot-otp-verify`, and `reset-password` endpoints utilizing temporary encrypted token cookies for secure state transition.
* **HTTP-Only Cookie Management:** Configured standard secure cookie attributes (`httpOnly`, `secure`, `sameSite: 'lax'`) for `accessToken`, `refreshToken`, and temporary verification tokens (`signup_token`, `forgotPassToken`).

### Challenges & System Architecture Decisions:
* **Challenge:** Ensuring secure OTP state transitions across multiple steps without creating unverified user records in DB.
* **Resolution (Architecture Decision):** Bound temporary verification state to HTTP-Only `signup_token` / `forgotPassToken` cookies alongside Redis cache keys, ensuring user record creation happens strictly after successful OTP verification.

### Next Steps (Tomorrow):
* **Company & Branch CRUD APIs:** Implement Company Profile setup and Branch management endpoints (`/company`, `/branch`).
* **Postman Integration Testing:** Execute end-to-end verification of entire Module 1 auth flow and session revocations.

---

## [2026-08-08] - Module 1 Scope Finalization, API Mapping & Multi-Tenant Architecture Alignment
**Author / Lead Developer:** Sanket Dahiya

### What I Did Today:
* **Module 1 API Specification & Mapping:** Finalized complete endpoint structures for Authentication, Company Profile (`/company`), Branch Management (`/branch`), and Staff Onboarding (`/staff`).
* **Role & Branch Context Architecture Alignment:** Confirmed dynamic branch switching for `SUPER_ADMIN` via Redis cache while ensuring `STAFF` roles remain strictly locked to their database-assigned `branchId`.
* **Schema Verification & Validation:** Reviewed and validated Prisma models (`User`, `UserSession`, `CompanyProfile`, `Branch`) for multi-tenant B2B compliance and foreign key integrity.
* **Codebase & Documentation Cleanup:** Refactored static utility classes (`PasswordUtils`), finalized Nodemailer transport config, and updated progress documentation in `DAILY_LOG.md`.

### Challenges & System Architecture Decisions:
* **Challenge:** Determining how `SUPER_ADMIN` accesses multiple branches without creating duplicate branch columns or forcing re-authentication.
* **Resolution (Architecture Decision):** Configured `SUPER_ADMIN` user record with `branchId: null` in DB, relying on Redis cache (`superadmin:active_branch:${userId}`) to dynamically populate `req.user.branchId` in `AuthGuard`.

### Next Steps (Tomorrow):
* **Company & Branch CRUD Implementation:** Build and test `/company/create`, `/branch/create`, and active branch switcher endpoints.
* **Staff Management Onboarding:** Implement internal `/staff/create` endpoint with explicit role and branch assignment.

---

## [2026-08-09] - Raw SQL Migration Strategy, PostgreSQL UUID Defaults & Constraint Alignment
**Author / Lead Developer:** Sanket Dahiya

### What I Did Today:
* **Database Persistence Layer Refactoring:** Shifted primary repository implementation pattern to raw SQL execution (`$executeRaw` / `$queryRaw`) to align with production performance standards and interview query evaluation.
* **PostgreSQL Native UUID Provisions:** Refactored Prisma schema to replace client-side `@default(uuid())` with database-level `@default(dbgenerated("gen_random_uuid()"))` for zero-dependency primary key generation.
* **Timestamp & Default Constraint Synchronization:** Configured `@default(now())` on `updatedAt` schema fields to ensure raw SQL `INSERT` queries execute cleanly without needing manual timestamp payloads.
* **Migration Cleanup & Database Reset:** Re-architected corrupt migration history, resolved foreign key drop constraint conflicts (`2BP01`), and performed a clean migration reset (`npx prisma migrate reset`).
* **Prepared Statement & Query Sanitization:** Sanitized raw query parameterization syntax, resolving PostgreSQL parameter binding mismatch (`08P01`) and verifying unique constraint enforcement (`23505`).

### Challenges & System Architecture Decisions:
* **Challenge:** Prisma's JS-level decorators (`uuid()`, `@updatedAt`) do not trigger during direct `$executeRaw` queries, causing null value constraint violations (`23502`) and parameter count errors (`08P01`).
* **Resolution (Architecture Decision):** Enforced PostgreSQL engine-level defaults (`gen_random_uuid()`, `NOW()`) directly in the database DDL, delegating UUID generation and timestamping fully to PostgreSQL while maintaining safe parameter interpolation without literal quotes.

### Next Steps (Tomorrow):
* **Module 1 API Implementation:** Build out repositories, services, and controllers for Auth, Company Profile, Branch Management, and Staff Onboarding.
* **Postman Integration Verification:** Execute full end-to-end testing for registration, OTP verification, company setup, and active branch switching.

---

## [2026-08-10] - RabbitMQ Microservice Architecture, Event-Driven Email Worker & SMTP Pipeline
**Author / Lead Developer:** Sanket Dahiya

### What I Did Today:
* **RabbitMQ Message Broker Migration:** Configured NestJS `ClientsModule` with `Transport.RMQ`, replacing legacy Kafka bindings with `ClientProxy` emitters and `@EventPattern` payload handlers.
* **Global Messaging Architecture:** Built a dedicated `@Global()` `RabbitMQModule` providing and exporting `ClientsModule` and `EmailJobs` to handle cross-module dependency injection seamlessly across the gateway app.
* **Worker Microservice & Nodemailer Integration:** Implemented an asynchronous worker microservice (`EmailController` & `EmailService`) consuming `USER_REGISTER_OTP_SEND` queue events for background email dispatch.
* **Environment Configuration & Bootstrap Fixes:** Resolved NestJS microservice environment loading timing issues by binding `ConfigModule` with `process.cwd()` path resolution in `AppWorkerModule`.
* **Branded Email Template Design:** Designed a responsive, production-ready HTML email template for **NexCorp Billing** featuring corporate header branding, isolated OTP highlight badges, and security disclaimers.

### Challenges & System Architecture Decisions:
* **Challenge 1:** NestJS dependency resolution failures (`UnknownDependenciesException` & `UnknownExportException`) when injecting `EmailJobs` inside `AuthModule`.
* **Resolution:** Registered `EmailJobs` within `RabbitMQModule`'s `providers` array while exporting both `ClientsModule` and `EmailJobs` globally from `AppModule`.
* **Challenge 2:** Nodemailer authentication crashes (`EAUTH 535 5.7.8 BadCredentials`) and payload recipient errors (`EENVELOPE / No recipients defined`).
* **Resolution:** Corrected parameter argument ordering `(email, otp)` across gateway/worker interfaces, implemented auto-trimming for 16-character Gmail App Passwords to strip space delimiters, and shifted transporter instantiation to on-demand execution.

### Next Steps (Tomorrow):
* **Signup OTP Verification API:** Implement `POST /api/v1/auth/signup-otp-verify` to compare client OTP against hashed Valkey cache values, persist verified user to DB, and generate JWT tokens.
* **Core Auth Endpoint Suite:** Build out Login OTP, Password Reset, and Token Refresh APIs in `AuthModule`.

---

## [2026-08-11] - RBAC Security, Cookie AuthGuard Pipeline & Atomic Prisma Raw SQL Transactions
**Author / Lead Developer:** Sanket Dahiya

### What I Did Today:
* **Role-Based Access Control (RBAC):** Built a custom `@Roles()` decorator and `RolesGuard` using NestJS `Reflector` and `ExecutionContext` to handle dynamic role authorization (`SUPER_ADMIN`, `ADMIN`, `ACCOUNTANT`, etc.).
* **AuthGuard & Request Context Pipeline:** Enhanced `AuthGuard` to parse JWT tokens (`accessToken` / `registerOtpVerify`) directly from HTTP cookies, decode claims (`userId`, `email`, `role`, `branchId`), and attach typed payloads to `IAuthorizedRequest`.
* **Registration & Secure Resend APIs:** Implemented `POST /api/v1/auth/user-register` and `POST /api/v1/auth/register-otp-resend`. Utilized cookie-driven context passing on resend endpoints without `@Public()` bypasses to prevent OTP email spamming.
* **Atomic Raw SQL Transactions:** Designed a multi-table atomic registration method inside `AuthRepository` using `this.prisma.$transaction`. Programmatically created a default `Main Branch` entry, retrieved its generated UUID, and linked it to the new `SUPER_ADMIN` user record.

### Challenges & System Architecture Decisions:
* **Challenge 1:** `req.user` evaluated as `undefined` in `register-otp-verify` and `register-otp-resend` controller endpoints.
* **Resolution:** Removed the `@Public()` decorator to allow `AuthGuard` execution on temporary cookie tokens, and replaced Express `Request` with `IAuthorizedRequest` to satisfy TypeScript context typing.
* **Challenge 2:** PostgreSQL Raw SQL execution crashes (`42601` Syntax Error, `42703` Column Not Found, `23502` Null Constraint).
* **Resolution:** Corrected `* RETURNING;` syntax to `RETURNING *;`, wrapped camelCase column names in double quotes (`"passwordHash"`, `"branchId"`) to stop Postgres from auto-lowercasing identifiers, and fixed property name mapping on hashed password data.
* **Challenge 3:** Prisma `$executeRaw` vs `$queryRaw` return type mismatch during multi-step user creation.
* **Resolution:** Replaced `$executeRaw` (which returns affected row counts) with `$queryRaw` inside `tx.$transaction`. Replaced `RETURNING *` with explicit column projections (`RETURNING id, email, role, "branchId"`) to keep password hashes out of memory and match strict TypeScript interfaces.

### Next Steps (Tomorrow):
* **Active Branch Caching:** Implement active branch persistence in Valkey cache (`superadmin:active_branch:${userId}`) for multi-tenant and multi-branch operations.
* **Login & Session Management:** Build `POST /api/v1/auth/login`, generate dual JWT tokens (`accessToken` 15m / `refreshToken` 7d), and implement branch switching & logout endpoints to complete Module 1.

---

## [2026-08-12] - Login Pipeline, Dual Token Issuance (JWT) & Valkey Branch Caching
**Author / Lead Developer:** Sanket Dahiya

### What I Did Today:
* **Login Authentication Pipeline:** Implemented `POST /api/v1/auth/login` endpoint validating user credentials via secure hash verification (`argon2`), handling active account status checks, and blocking login attempts for unverified accounts.
* **Dual-Token Architecture (Access & Refresh):** Built token issuance mechanism generating short-lived `accessToken` (15m TTL) for stateless authorization and long-lived `refreshToken` (7d TTL) for session persistence.
* **Session Persistence Layer:** Designed database session tracking storing user session records in the `sessions` table with client metadata (`ipAddress`, `userAgent`, `isRevoked = false`, expiration timestamps).
* **Valkey Branch State Caching:** Integrated Valkey (Redis) caching layer to persist active branch state for `SUPER_ADMIN` and multi-branch users (`superadmin:active_branch:${userId}`), ensuring zero DB overhead during branch resolution.
* **Cookie Security & Delivery:** Configured secure HTTP-only cookies (`httpOnly: true`, `sameSite: 'lax'`, `secure: process.env.NODE_ENV === 'production'`) for seamless access and refresh token distribution.

### Challenges & System Architecture Decisions:
* **Challenge 1:** Handling `SUPER_ADMIN` default branch resolution vs assigned employee branches during login without causing redundant SQL joins.
* **Resolution:** Cached the primary branch UUID immediately into Valkey on login response creation, decoupling branch retrieval from standard authentication checks.
* **Challenge 2:** Ensuring device/client traceability while handling token storage in the `sessions` table.
* **Resolution:** Extracted client metadata (`req.ip`, `req.headers['user-agent']`) and stored hashed refresh tokens alongside timestamps to prevent token exposure in database breach scenarios.
* **Challenge 3:** Cookie parsing and expiration mismatch between JWT payload `exp` and HTTP cookie `maxAge`.
* **Resolution:** Standardized cookie `maxAge` to strictly mirror JWT expiration time in milliseconds (15 mins for access token, 7 days for refresh token).

### Next Steps (Tomorrow):
* **Refresh Token Rotation & Security:** Implement `POST /api/v1/auth/refresh-token` with automatic token rotation, revocation validation, and payload integrity checks.
* **Branch Switching Engine:** Build `POST /api/v1/auth/switch-branch` for `SUPER_ADMIN` users with real-time Valkey cache synchronization.

---

## [2026-08-13] - Refresh Token Rotation, Session Invalidation & Valkey Switch-Branch Pipeline
**Author / Lead Developer:** Sanket Dahiya

### What I Did Today:
* **Refresh Token Rotation Engine:** Built `POST /api/v1/auth/refresh-token` endpoint implementing automatic single-use refresh token rotation to prevent replay and token hijacking attacks.
* **Session Revocation Guardrails:** Implemented database validation against `sessions` table checking `isRevoked` flags and expiration before issuing fresh access tokens.
* **SuperAdmin Branch Switch API:** Implemented `POST /api/v1/auth/switch-branch` endpoint allowing `SUPER_ADMIN` to dynamically switch operational branch contexts, persisting selected branch IDs into Valkey (`superadmin:active_branch:${userId}`).
* **Contextual Token Re-issuance:** Engineered dynamic payload creation on token refresh to seamlessly inject newly switched branch IDs into regenerated `accessToken` claims without requiring re-authentication.
* **Cookie Synchronizer:** Upgraded cookie dispatch pipeline to atomic multi-set operations, refreshing both `accessToken` and `refreshToken` cookies concurrently on valid rotation cycles.

### Challenges & System Architecture Decisions:
* **Challenge 1:** Race conditions and stale token re-use during rapid concurrent refresh token requests from client interceptors.
* **Resolution:** Enforced strict database status checks (`isRevoked: false`) and invalidated old refresh token records immediately before issuing and persisting the newly signed token pairs.
* **Challenge 2:** Branch switching context loss across distributed requests.
* **Resolution:** Centralized branch context resolution by querying Valkey cache directly within authorization middleware before falling back to default tenant branches.
* **Challenge 3:** Preserving token payload cleanliness during regeneration.
* **Resolution:** Sanitized decoded JWT payloads by stripping automatic claims (`iat`, `exp`, `nbf`) before re-signing to eliminate malformed token signature exceptions.

### Next Steps (Tomorrow):
* **Token Rotation Latency Optimization:** Benchmark and optimize refresh token cycle response times.
* **Password Reset & Global Invalidation Architecture:** Design forgot password email pipeline with rate-limited OTP verification and global multi-device session revocation via `passwordChangedAt` timestamp tracking.

---