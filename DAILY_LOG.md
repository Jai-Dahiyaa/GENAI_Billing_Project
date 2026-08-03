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